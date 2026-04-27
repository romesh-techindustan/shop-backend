import express from "express";
import * as addressController from "../controllers/address.controller.js";
import { addressDTO, updateAddressDTO } from "../dto/address.dto.js";
import asyncHandler from "../middleware/async-handler.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", asyncHandler(addressController.getAddresses));
router.post("/", validate(addressDTO), asyncHandler(addressController.createAddress));
router.get("/:addressId", asyncHandler(addressController.getAddressById));
router.patch(
  "/:addressId",
  validate(updateAddressDTO),
  asyncHandler(addressController.updateAddress)
);
router.delete("/:addressId", asyncHandler(addressController.deleteAddress));

export default router;
