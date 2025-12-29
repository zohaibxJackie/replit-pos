import { db } from "../config/database.js";
import {
  repairJobs,
  repairPayments,
  repairPersons,
} from "../../shared/schema.js";
import { eq, and, desc, sql, or, ilike } from "drizzle-orm";
import { paginationHelper, generateTicketNumber } from "../utils/helpers.js";

export const getRepairJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      repairPersonId,
      search,
    } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const shopId = req.userShopIds?.[0];

    let conditions = [eq(repairJobs.shopId, shopId)];

    if (status) {
      conditions.push(eq(repairJobs.status, status));
    }

    if (priority) {
      conditions.push(eq(repairJobs.priority, priority));
    }

    if (repairPersonId) {
      conditions.push(eq(repairJobs.repairPersonId, repairPersonId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(repairJobs.ticketNumber, `%${search}%`),
          ilike(repairJobs.customerName, `%${search}%`),
          ilike(repairJobs.customerPhone, `%${search}%`),
          ilike(repairJobs.deviceBrand, `%${search}%`),
          ilike(repairJobs.deviceModel, `%${search}%`)
        )
      );
    }

    const whereClause = and(...conditions);

    const jobs = await db
      .select()
      .from(repairJobs)
      .where(whereClause)
      .orderBy(desc(repairJobs.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(repairJobs)
      .where(whereClause);

    res.json({
      repairJobs: jobs,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit),
      },
    });
  } catch (error) {
    console.error("Get repair jobs error:", error);
    res.status(500).json({ error: req.t("repair.jobs_fetch_failed") });
  }
};

export const getRepairJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const [job] = await db
      .select()
      .from(repairJobs)
      .where(
        and(eq(repairJobs.id, id), eq(repairJobs.shopId, req.userShopIds?.[0]))
      )
      .limit(1);

    if (!job) {
      return res.status(404).json({ error: req.t("repair.job_not_found") });
    }

    const payments = await db
      .select()
      .from(repairPayments)
      .where(eq(repairPayments.repairJobId, id))
      .orderBy(desc(repairPayments.createdAt));

    let repairPerson = null;
    if (job.repairPersonId) {
      const [person] = await db
        .select()
        .from(repairPersons)
        .where(eq(repairPersons.id, job.repairPersonId))
        .limit(1);
      repairPerson = person;
    }

    res.json({ repairJob: job, payments, repairPerson });
  } catch (error) {
    console.error("Get repair job by id error:", error);
    res.status(500).json({ error: req.t("repair.job_fetch_failed") });
  }
};

export const createRepairJob = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      customerDni,
      deviceBrand,
      deviceModel,
      imei,
      defectSummary,
      problemDescription,
      priority,
      estimatedCost,
      advancePayment,
      repairPersonId,
      autoAssign,
      dueDate,
    } = req.validatedBody;

    const shopId = req.userShopIds?.[0];
    const ticketNumber = generateTicketNumber("REP");

    let assignedRepairPersonId = repairPersonId;
    let repairPersonName = null;

    if (autoAssign && !repairPersonId) {
      const [availablePerson] = await db
        .select()
        .from(repairPersons)
        .where(
          and(
            eq(repairPersons.shopId, shopId),
            eq(repairPersons.isAvailable, true)
          )
        )
        .limit(1);

      if (availablePerson) {
        assignedRepairPersonId = availablePerson.id;
        repairPersonName = availablePerson.name;
      }
    } else if (repairPersonId) {
      const [person] = await db
        .select()
        .from(repairPersons)
        .where(eq(repairPersons.id, repairPersonId))
        .limit(1);
      if (person) {
        repairPersonName = person.name;
      }
    }

    const [newJob] = await db
      .insert(repairJobs)
      .values({
        shopId,
        ticketNumber,
        customerId: customerId || null,
        customerName,
        customerPhone,
        customerDni,
        deviceBrand,
        deviceModel,
        imei,
        defectSummary,
        problemDescription,
        priority: priority || "normal",
        status: assignedRepairPersonId ? "assigned" : "pending",
        estimatedCost: estimatedCost?.toString(),
        advancePayment: (advancePayment || 0).toString(),
        totalPaid: (advancePayment || 0).toString(),
        repairPersonId: assignedRepairPersonId,
        repairPersonName,
        autoAssign: autoAssign || false,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedAt: assignedRepairPersonId ? new Date() : null,
      })
      .returning();

    if (advancePayment && advancePayment > 0) {
      await db.insert(repairPayments).values({
        repairJobId: newJob.id,
        amount: advancePayment.toString(),
        paymentMethod: "cash",
        note: "Advance payment",
      });
    }

    res.status(201).json({ repairJob: newJob });
  } catch (error) {
    console.error("Create repair job error:", error);
    res.status(500).json({ error: req.t("repair.job_create_failed") });
  }
};

export const updateRepairJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, repairPersonId, estimatedCost, notes } = req.body;

    const [existingJob] = await db
      .select()
      .from(repairJobs)
      .where(
        and(eq(repairJobs.id, id), eq(repairJobs.shopId, req.userShopIds?.[0]))
      )
      .limit(1);

    if (!existingJob) {
      return res.status(404).json({ error: req.t("repair.job_not_found") });
    }

    const updateData = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
    }

    if (repairPersonId !== undefined) {
      if (repairPersonId) {
        const [person] = await db
          .select()
          .from(repairPersons)
          .where(eq(repairPersons.id, repairPersonId))
          .limit(1);
        if (person) {
          updateData.repairPersonId = repairPersonId;
          updateData.repairPersonName = person.name;
          updateData.assignedAt = new Date();
          if (!existingJob.status || existingJob.status === "pending") {
            updateData.status = "assigned";
          }
        }
      } else {
        updateData.repairPersonId = null;
        updateData.repairPersonName = null;
      }
    }

    if (estimatedCost !== undefined) {
      updateData.estimatedCost = estimatedCost?.toString();
    }

    const [updatedJob] = await db
      .update(repairJobs)
      .set(updateData)
      .where(eq(repairJobs.id, id))
      .returning();

    res.json({ repairJob: updatedJob });
  } catch (error) {
    console.error("Update repair job error:", error);
    res.status(500).json({ error: req.t("repair.job_update_failed") });
  }
};

export const addRepairPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, note } = req.validatedBody;

    const [existingJob] = await db
      .select()
      .from(repairJobs)
      .where(
        and(eq(repairJobs.id, id), eq(repairJobs.shopId, req.userShopIds?.[0]))
      )
      .limit(1);

    if (!existingJob) {
      return res.status(404).json({ error: req.t("repair.job_not_found") });
    }

    const [newPayment] = await db
      .insert(repairPayments)
      .values({
        repairJobId: id,
        amount: amount.toString(),
        paymentMethod: paymentMethod || "cash",
        note,
      })
      .returning();

    const newTotalPaid = parseFloat(existingJob.totalPaid) + amount;

    await db
      .update(repairJobs)
      .set({ totalPaid: newTotalPaid.toString(), updatedAt: new Date() })
      .where(eq(repairJobs.id, id));

    res.status(201).json({ payment: newPayment, totalPaid: newTotalPaid });
  } catch (error) {
    console.error("Add repair payment error:", error);
    res.status(500).json({ error: req.t("repair.payment_add_failed") });
  }
};

export const getRepairPersons = async (req, res) => {
  try {
    const shopId = req.userShopIds?.[0];

    const persons = await db
      .select()
      .from(repairPersons)
      .where(eq(repairPersons.shopId, shopId))
      .orderBy(repairPersons.name);

    res.json({ repairPersons: persons });
  } catch (error) {
    console.error("Get repair persons error:", error);
    res.status(500).json({ error: req.t("repair.persons_fetch_failed") });
  }
};

export const createRepairPerson = async (req, res) => {
  try {
    const { name, phone, email, isAvailable } = req.validatedBody;

    const [newPerson] = await db
      .insert(repairPersons)
      .values({
        shopId: req.userShopIds?.[0],
        name,
        phone,
        email,
        isAvailable: isAvailable !== false,
      })
      .returning();

    res.status(201).json({ repairPerson: newPerson });
  } catch (error) {
    console.error("Create repair person error:", error);
    res.status(500).json({ error: req.t("repair.person_create_failed") });
  }
};

export const updateRepairPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, isAvailable } = req.body;

    const [existingPerson] = await db
      .select()
      .from(repairPersons)
      .where(
        and(
          eq(repairPersons.id, id),
          eq(repairPersons.shopId, req.userShopIds?.[0])
        )
      )
      .limit(1);

    if (!existingPerson) {
      return res.status(404).json({ error: req.t("repair.person_not_found") });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const [updatedPerson] = await db
      .update(repairPersons)
      .set(updateData)
      .where(eq(repairPersons.id, id))
      .returning();

    res.json({ repairPerson: updatedPerson });
  } catch (error) {
    console.error("Update repair person error:", error);
    res.status(500).json({ error: req.t("repair.person_update_failed") });
  }
};

export const deleteRepairPerson = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingPerson] = await db
      .select()
      .from(repairPersons)
      .where(
        and(
          eq(repairPersons.id, id),
          eq(repairPersons.shopId, req.userShopIds?.[0])
        )
      )
      .limit(1);

    if (!existingPerson) {
      return res.status(404).json({ error: req.t("repair.person_not_found") });
    }

    await db.delete(repairPersons).where(eq(repairPersons.id, id));

    res.json({ message: req.t("repair.person_deleted") });
  } catch (error) {
    console.error("Delete repair person error:", error);
    res.status(500).json({ error: req.t("repair.person_delete_failed") });
  }
};

export default {
  getRepairJobs,
  getRepairJobById,
  createRepairJob,
  updateRepairJob,
  addRepairPayment,
  getRepairPersons,
  createRepairPerson,
  updateRepairPerson,
  deleteRepairPerson,
};
