import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define(
  'order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'paid',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled',
        'fulfilled'
      ),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentProvider: {
      type: DataTypes.ENUM('stripe', 'cod'),
      allowNull: false,
      defaultValue: 'stripe',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'usd',
      set(value) {
        this.setDataValue('currency', String(value).trim().toLowerCase());
      },
    },
    shippingAddressId:{
      type: DataTypes.UUID,
      allowNull: true,
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    stripeClientSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default Order;
