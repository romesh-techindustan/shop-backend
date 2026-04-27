import { DataTypes } from 'sequelize';
import sequelize from './database.js';

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName);

  if (table[columnName]) {
    return;
  }

  await queryInterface.addColumn(tableName, columnName, definition);
}

export default async function syncDatabase() {
  await sequelize.sync();

  const queryInterface = sequelize.getQueryInterface();

  await addColumnIfMissing(queryInterface, 'users', 'is_admin', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await addColumnIfMissing(queryInterface, 'users', 'two_factor_otp_token', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'users', 'two_factor_otp_expires_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'stripeCheckoutSessionId', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'stripePaymentIntentId', {
    type: DataTypes.STRING,
    allowNull: true,
  });
}
