import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { RepairJob } from "@shared/schema";
import { format } from "date-fns";

interface RepairJobTicketProps {
  job: RepairJob;
  shopInfo?: {
    name: string;
    address?: string;
    phone?: string;
  };
}

export function RepairJobTicket({ job, shopInfo }: RepairJobTicketProps) {
  const [qrCode, setQrCode] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          ticketNumber: job.ticketNumber,
          id: job.id,
        });
        const qrUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCode(qrUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    };

    generateQR();
  }, [job.id, job.ticketNumber]);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    waiting_parts: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    delivered: "bg-teal-100 text-teal-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 bg-white text-black max-w-[80mm] mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4 border-b-2 border-black pb-2">
        <h1 className="text-xl font-bold">{shopInfo?.name || "Repair Shop"}</h1>
        {shopInfo?.address && <p className="text-xs">{shopInfo.address}</p>}
        {shopInfo?.phone && <p className="text-xs">Tel: {shopInfo.phone}</p>}
      </div>

      {/* Ticket Number */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold border-2 border-black p-2">
          #{job.ticketNumber}
        </div>
      </div>

      {/* QR Code */}
      {qrCode && (
        <div className="flex justify-center mb-4">
          <img src={qrCode} alt="Ticket QR Code" className="w-32 h-32" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Job Details */}
      <div className="space-y-2 mb-4 text-xs">
        <div className="flex justify-between border-b border-gray-300 pb-1">
          <span className="font-semibold">Date:</span>
          <span>{job.createdAt ? format(new Date(job.createdAt), "dd/MM/yyyy HH:mm") : "N/A"}</span>
        </div>

        <div className="flex justify-between border-b border-gray-300 pb-1">
          <span className="font-semibold">Status:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColors[job.status] || "bg-gray-100 text-gray-800"}`}>
            {job.status.toUpperCase()}
          </span>
        </div>

        {job.priority === "urgent" && (
          <div className="flex justify-between border-b border-gray-300 pb-1">
            <span className="font-semibold">Priority:</span>
            <span className="text-red-600 font-bold">URGENT</span>
          </div>
        )}
      </div>

      {/* Customer Information */}
      <div className="mb-4 border-t-2 border-black pt-2">
        <h2 className="font-bold mb-2 text-sm">CUSTOMER INFORMATION</h2>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold">Name:</span>
            <span>{job.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Phone:</span>
            <span>{job.customerPhone}</span>
          </div>
          {job.customerDni && (
            <div className="flex justify-between">
              <span className="font-semibold">ID:</span>
              <span>{job.customerDni}</span>
            </div>
          )}
        </div>
      </div>

      {/* Device Information */}
      <div className="mb-4 border-t-2 border-black pt-2">
        <h2 className="font-bold mb-2 text-sm">DEVICE INFORMATION</h2>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold">Brand:</span>
            <span>{job.deviceBrand}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Model:</span>
            <span>{job.deviceModel}</span>
          </div>
          {job.imei && (
            <div className="flex justify-between">
              <span className="font-semibold">IMEI:</span>
              <span>{job.imei}</span>
            </div>
          )}
        </div>
      </div>

      {/* Problem Description */}
      <div className="mb-4 border-t-2 border-black pt-2">
        <h2 className="font-bold mb-2 text-sm">PROBLEM DESCRIPTION</h2>
        <div className="text-xs">
          <p className="font-semibold">{job.defectSummary}</p>
          <p className="mt-1 text-gray-700">{job.problemDescription}</p>
        </div>
      </div>

      {/* Cost Information */}
      <div className="mb-4 border-t-2 border-black pt-2">
        <h2 className="font-bold mb-2 text-sm">COST INFORMATION</h2>
        <div className="space-y-1 text-xs">
          {job.estimatedCost && (
            <div className="flex justify-between">
              <span className="font-semibold">Estimated Cost:</span>
              <span>${Number(job.estimatedCost).toFixed(2)}</span>
            </div>
          )}
          {job.advancePayment && Number(job.advancePayment) > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold">Advance Paid:</span>
              <span>${Number(job.advancePayment).toFixed(2)}</span>
            </div>
          )}
          {job.estimatedCost && job.advancePayment && (
            <div className="flex justify-between font-bold border-t border-gray-400 pt-1 mt-1">
              <span>Balance Due:</span>
              <span>${(Number(job.estimatedCost) - Number(job.advancePayment)).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Repair Person */}
      {job.repairPersonName && (
        <div className="mb-4 border-t-2 border-black pt-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold">Assigned To:</span>
            <span>{job.repairPersonName}</span>
          </div>
        </div>
      )}

      {/* Due Date */}
      {job.dueDate && (
        <div className="mb-4 border-t-2 border-black pt-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold">Expected By:</span>
            <span>{format(new Date(job.dueDate), "dd/MM/yyyy")}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-black text-xs">
        <p className="font-semibold">Thank you for your business!</p>
        <p className="mt-1">Please keep this ticket safe</p>
        <p className="mt-1">Scan QR code to track your repair</p>
      </div>
    </div>
  );
}
