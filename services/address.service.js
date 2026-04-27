import sequelize from "../config/database.js";
import { addressResponse } from "../dto/address-response.dto.js";
import { AppError } from "../middleware/error-response.js";
import * as addressRepository from "../repositories/address.repository.js";

function normalizeAddress(data) {
  return {
    ...data,
    ...(Object.prototype.hasOwnProperty.call(data, "line2")
      ? { line2: data.line2?.trim() || null }
      : {}),
    ...(data.country ? { country: data.country.toUpperCase() } : {}),
  };
}

async function setOnlyDefaultAddress(userId, address, options = {}) {
  if (!address.isDefault) {
    return;
  }

  await addressRepository.clearDefaultAddress(userId, options);
}

export async function getAddresses(userId) {
  const addresses = await addressRepository.findAddressesByUserId(userId);

  return addresses.map(addressResponse);
}

export async function getAddressById(userId, addressId) {
  const address = await addressRepository.findAddressById(userId, addressId);

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  return addressResponse(address);
}

export async function createAddress(userId, data) {
  const normalizedAddress = normalizeAddress(data);

  const address = await sequelize.transaction(async (transaction) => {
    await setOnlyDefaultAddress(userId, normalizedAddress, { transaction });

    return addressRepository.createAddress(userId, normalizedAddress, {
      transaction,
    });
  });

  return addressResponse(address);
}

export async function updateAddress(userId, addressId, data) {
  const normalizedAddress = normalizeAddress(data);

  const address = await sequelize.transaction(async (transaction) => {
    const existingAddress = await addressRepository.findAddressById(
      userId,
      addressId,
      { transaction }
    );

    if (!existingAddress) {
      throw new AppError("Address not found", 404);
    }

    await setOnlyDefaultAddress(userId, normalizedAddress, { transaction });

    return addressRepository.updateAddress(existingAddress, normalizedAddress, {
      transaction,
    });
  });

  return addressResponse(address);
}

export async function deleteAddress(userId, addressId) {
  await sequelize.transaction(async (transaction) => {
    const address = await addressRepository.findAddressById(userId, addressId, {
      transaction,
    });

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    await addressRepository.deleteAddress(address, { transaction });
  });

  return { id: addressId };
}
