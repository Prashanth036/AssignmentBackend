// controllers/userController.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// import db from '../models/index.js';
import { generateAccessToken } from '../middleware/isAuthenicatedMiddleware.js';

import { createRequire } from 'module';
import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../index.js';
const require = createRequire(import.meta.url);
const User= require('../models/user.cjs');



 



const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User(sequelize,DataTypes).findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const accessToken = generateAccessToken(user.userName, process.env.JWTSECRET, "10m");
    const refreshToken = generateAccessToken(user.email, process.env.REFRESH_TOKEN_SECRET, "24h");

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      // sameSite: 'None', // Adjust as per your security requirements
      // secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // console.log('Set-Cookie Header:', res.getHeader('Set-Cookie')); 

    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

const CreateUser = async (req, res) => {
  const { userName, email, password ,company} =await req.body;
  console.log(User);
  console.log(req.body)

  try {
    let newUser = await User(sequelize,DataTypes).create({ userName, email, password ,company});
    console.log( process.env.JWTSECRET)

    const accessToken = generateAccessToken(newUser.userName, process.env.JWTSECRET, "10m");
    const refreshToken = generateAccessToken(newUser.email, process.env.REFRESH_TOKEN_SECRET, "24h");

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: 'None', // Adjust as per your security requirements
      secure: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("CreateUser error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

const getUser = async (req, res) => {
  const { username } = req.user;
  console.log(username)
  try {
    const user = await User(sequelize,DataTypes).findOne({ where: {email: username } });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error("getUser error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await User(sequelize,DataTypes).findAll();
    res.status(200).json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { password, ...payload } = req.body;

  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(password, salt);
    }

    const [updatedCount] = await User.update(payload, { where: { id: userId } });

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export {
  CreateUser,
  getUser,
  getUsers,
  Login,
  updateUser
};
