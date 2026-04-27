import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Wishlist = sequelize.define("wishlist", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["userId", "productId"],
    },
  ],
});

export default Wishlist;
