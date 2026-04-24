import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Cart = sequelize.define("cart", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
});

export default Cart;
