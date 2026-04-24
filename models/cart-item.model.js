import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CartItem = sequelize.define("cart_item", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },

  priceAtTime: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  selectedColor: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  selectedSize: {
    type: DataTypes.ENUM("XS", "S", "M", "L", "XL", "XXL"),
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default CartItem;
