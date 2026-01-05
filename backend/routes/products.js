import { Router } from "express";
import * as productController from "../controllers/productController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { validate } from "../validators/auth.js";
import {
  createStockSchema,
  updateStockItemSchema,
  bulkCreateStockSchema,
} from "../validators/product.js";

const router = Router();

router.use(authenticateToken);

router.get("/", productController.getProducts);
router.get("/low-stock", productController.getLowStockProducts);
router.get("/categories", productController.getCategories);
router.get("/brands", productController.getBrands);
router.get("/products-global", productController.getProducts_Global);
router.get("/variants", productController.getVariants);
router.get("/catalog/mobiles", productController.getMobileCatalog);
router.get("/catalog/mobiles/brands", productController.getMobileCatalogBrands);
router.get("/catalog/mobiles/models", productController.getMobileCatalogModels);
router.get("/catalog/mobiles/colors", productController.getMobileCatalogColors);
router.get("/catalog/mobiles/item", productController.getMobileCatalogItem);
//for stock-batches
router.post("/accessories", productController.createAccessoryStock);
router.get("/catalog/accessories", productController.getAccessoryCatalog);
router.get(
  "/catalog/accessories/brands",
  productController.getAccessoryCatalogModels
);
router.get("/barcode/:barcode", productController.getProductByBarcode);
router.get("/imei/:imei", productController.getProductByImei);
router.get("/:id", productController.getProductById);
router.post(
  "/",
  requireRole("admin"),
  validate(createStockSchema),
  productController.createProduct
);
router.post(
  "/bulk",
  requireRole("admin"),
  validate(bulkCreateStockSchema),
  productController.bulkCreateProducts
);
router.put(
  "/:id",
  requireRole("admin"),
  validate(updateStockItemSchema),
  productController.updateProduct
);
router.patch(
  "/:id/status",
  requireRole("admin", "sales_person"),
  productController.updateStockStatus
);
router.delete(
  "/:id",
  requireRole("admin", "super_admin"),
  productController.deleteProduct
);

export default router;
