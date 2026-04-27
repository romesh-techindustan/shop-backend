function asPlainRecord(model) {
  if (model && typeof model.get === "function") {
    return model.get({ plain: true });
  }

  return model;
}

export function addressResponse(addressModel) {
  const address = asPlainRecord(addressModel);

  if (!address) {
    return null;
  }

  return {
    id: address.id,
    userId: address.userId,
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: Boolean(address.isDefault),
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}
