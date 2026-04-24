import Cart from "./cart.model.js";
import Product from "./product.model.js";
import CartItem from "./cart-item.model.js";
import Order from './order.model.js';
import OrderItem from './order-item.model.js';
import User from "./user.model.js";
import { Address } from "./address.model.js";

User.hasOne(Cart, {
  foreignKey: "userId",
  as: "cart",
});

Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Cart.belongsToMany(Product, {
  through: CartItem,
  foreignKey: "cartId",
  otherKey: "productId",
  as: "products",
});

Product.belongsToMany(Cart, {
  through: CartItem,
  foreignKey: "productId",
  otherKey: "cartId",
  as: "carts",
});

Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
  as: "cart",
});

Product.hasMany(CartItem, {
  foreignKey: "productId",
  as: "cartItems",
});

CartItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
});

Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE',
});

Order.belongsTo(Address, {
  foreignKey: 'shippingAddressId',
  as: 'address',
});

Address.hasMany(Order, {
  foreignKey: 'shippingAddressId',
  as: 'orders',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems',
});

OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

User.hasMany(Address, {
  foreignKey: 'userId',
  as: 'addresses',
});

Address.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export {
  Cart,
  Product,
  CartItem,
  Order,
  OrderItem,
  User,
  Address,
};
