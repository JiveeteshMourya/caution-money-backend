import { Router } from "express";
import { getImageById } from "../controllers/imageControllers.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = Router();

router.get("/:i_id", wrapAsync(getImageById));

export default router;
