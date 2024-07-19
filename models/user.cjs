'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');


module.exports = (sequelize,DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  User.init({
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Username already exists'
      },
      validate: {
        notNull: {
          msg: 'Username is required'
        },
        len: {
          args: [3, 30],
          msg: 'Username length must be between 3 and 30 characters'
        }
      },
      set(value) {
        this.setDataValue('userName', value.trim()); // Trim whitespace
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        notNull: {
          msg: 'Email is required'
        },
        isEmail: {
          msg: 'Must be a valid email address'
        }
      },
      set(value) {
        this.setDataValue('email', value.trim()); // Trim whitespace
      }
    },
    company: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 50],
          msg: 'Company name cannot exceed 50 characters'
        }
      },
      set(value) {
        this.setDataValue('company', value ? value.trim() : null); // Trim whitespace or set to null if empty
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required'
        },
        len: {
          args: [8, 100],
          msg: 'Password must be between 8 and 100 characters'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  User.sync();
  return User;
};
