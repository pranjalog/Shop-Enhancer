import { Router, type IRouter } from "express";
import healthRouter from "./health";
import paymentsRouter from "./payments";
import storageRouter from "./storage";
import productsRouter from "./products";
import adminRouter from "./admin";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(paymentsRouter);
router.use(storageRouter);
router.use(productsRouter);
router.use(adminRouter);
router.use(ordersRouter);

export default router;
