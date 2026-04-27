import { Address } from "../models/associations.js";

export async function findAddressesByUserId(userId, options = {}) {
  return Address.findAll({
    where: { userId },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "DESC"],
    ],
    transaction: options.transaction,
  });
}

export async function findAddressById(userId, addressId, options = {}) {
  return Address.findOne({
    where: {
      id: addressId,
      userId,
    },
    transaction: options.transaction,
  });
}

export async function clearDefaultAddress(userId, options = {}) {
  return Address.update(
    { isDefault: false },
    {
      where: { userId },
      transaction: options.transaction,
    }
  );
}

export async function createAddress(userId, data, options = {}) {
  return Address.create(
    {
      ...data,
      userId,
    },
    {
      transaction: options.transaction,
    }
  );
}

export async function updateAddress(address, data, options = {}) {
  await address.update(data, {
    transaction: options.transaction,
  });

  return address;
}

export async function deleteAddress(address, options = {}) {
  return address.destroy({
    transaction: options.transaction,
  });
}
