import { Op } from 'sequelize';
import { Order, OrderItem, Product } from '../models/associations.js';

const orderInclude = [
  {
    model: OrderItem,
    as: 'items',
    include: [
      {
        model: Product,
        as: 'product',
      },
    ],
  },
];

export async function createOrder(data, options = {}) {
  return Order.create(data, {
    transaction: options.transaction,
  });
}

export async function bulkCreateOrderItems(items, options = {}) {
  return OrderItem.bulkCreate(items, {
    transaction: options.transaction,
  });
}

export async function findOrdersByUserId(userId) {
  return Order.findAll({
    where: { userId },
    include: orderInclude,
    order: [['createdAt', 'DESC']],
  });
}

export async function findOrders({
  page = 1,
  limit = 20,
  userId,
  status,
  paymentProvider,
  paymentStatus,
} = {}) {
  const where = {};

  if (userId) {
    where.userId = userId;
  }

  if (status) {
    where.status = status;
  }

  if (paymentProvider) {
    where.paymentProvider = paymentProvider;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  return Order.findAndCountAll({
    where,
    include: orderInclude,
    limit,
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });
}

export async function findOrderByIdForUser(orderId, userId) {
  return Order.findOne({
    where: {
      id: orderId,
      userId,
    },
    include: orderInclude,
  });
}

export async function findOrderById(orderId, options = {}) {
  return Order.findByPk(orderId, {
    include: orderInclude,
    transaction: options.transaction,
  });
}

export async function findOrderByIdForUpdate(orderId, options = {}) {
  return Order.findByPk(orderId, {
    include: orderInclude,
    transaction: options.transaction,
    lock: options.lock,
  });
}

export async function findPendingOrderByUserId(userId) {
  return Order.findOne({
    where: {
      userId,
      status: 'pending',
      paymentStatus: 'pending',
      paymentProvider: 'stripe',
    },
    include: orderInclude,
    order: [['createdAt', 'DESC']],
  });
}

export async function findCurrentStripeCheckoutByUserId(userId) {
  return Order.findOne({
    where: {
      userId,
      status: 'pending',
      paymentStatus: 'pending',
      paymentProvider: 'stripe',
      stripePaymentIntentId: {
        [Op.ne]: null,
      },
    },
    include: orderInclude,
    order: [['createdAt', 'DESC']],
  });
}

export async function findOrderByPaymentIntentId(paymentIntentId, options = {}) {
  return Order.findOne({
    where: {
      stripePaymentIntentId: paymentIntentId,
    },
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
          },
        ],
      },
    ],
    transaction: options.transaction,
  });
}

export async function updateOrder(order, data, options = {}) {
  await order.update(data, {
    transaction: options.transaction,
  });

  return order;
}
