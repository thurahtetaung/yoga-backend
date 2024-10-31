// src/models/class.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Class', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teacher: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });
};