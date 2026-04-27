import * as addressService from "../services/address.service.js";

export async function getAddresses(req, res) {
  const addresses = await addressService.getAddresses(req.user.id);

  res.success(addresses, "Addresses retrieved successfully");
}

export async function getAddressById(req, res) {
  const address = await addressService.getAddressById(
    req.user.id,
    req.params.addressId
  );

  res.success(address, "Address retrieved successfully");
}

export async function createAddress(req, res) {
  const address = await addressService.createAddress(
    req.user.id,
    req.validatedData
  );

  res.success(address, "Address created successfully", 201);
}

export async function updateAddress(req, res) {
  const address = await addressService.updateAddress(
    req.user.id,
    req.params.addressId,
    req.validatedData
  );

  res.success(address, "Address updated successfully");
}

export async function deleteAddress(req, res) {
  const address = await addressService.deleteAddress(
    req.user.id,
    req.params.addressId
  );

  res.success(address, "Address deleted successfully");
}
