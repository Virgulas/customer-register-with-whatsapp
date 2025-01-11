const { Sequelize, DataTypes, Model } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/users_data.sqlite'
});

class User extends Model {}

// Define the Sequelize model
User.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  birthday: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  period: {
    type: DataTypes.INTEGER,
    defaultValue: false
  },
  callDate: {
    type: DataTypes.STRING,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'User',
});

  module.exports = {
    User,
    sequelize
  }