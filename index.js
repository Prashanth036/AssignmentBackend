import express from 'express';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import bodyParser from "body-parser"
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import { CreateUser, getUser, getUsers, Login, updateUser } from './controllers/AuthorizationController.js';
import { isAuthenticatedMiddleware } from './middleware/isAuthenicatedMiddleware.js';

const Sequelize = require('sequelize');

const app = express();
const port = process.env.PORT || 3000;

// const corsOptions = {
//   origin: 'http://localhost:5173/' ,
//   //  'https://prashanth036.github.io', // Replace with your React app's URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true, // Allow credentials (cookies, authorization headers),
//   allowedHeaders: ['Content-Type', 'Authorization'] // Allow necessary headers

// };

const corsOptions = {
  origin: process.env.FrontEndUrl,// Corrected URL without trailing slash
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow credentials (cookies, authorization headers)
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow necessary headers
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(cors(corsOptions));

const sequelize = new Sequelize({
  "dialect": "sqlite",
  "storage": "./database.sqlite"
})
sequelize.authenticate().then(()=>{
sequelize.sync()
  .then(() => {
    console.log('Connection has been established successfully.');
    return app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });;
  })
})
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


app.post('/login', Login);
app.post('/register', CreateUser);
app.get('/user', isAuthenticatedMiddleware, getUser);
app.get('/users', isAuthenticatedMiddleware, getUsers);
app.put('/user/:userId', updateUser);





  export default sequelize
