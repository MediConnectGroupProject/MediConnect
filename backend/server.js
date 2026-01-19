import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";

import { errorHandler } from './middleware/errorHandlerMiddleware.js';
import cookieParser from "cookie-parser";
import passport from './config/passport.js';
import './middleware/inventoryMiddleware.js'

// import routes here ....
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';



// Load environment variables from .env file
dotenv.config();
const PORT = process.env.SERVER_PORT || 5000;
const app = express();

// middleware setup here ...
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE" ,"PATCH"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser()); 
app.use(passport.initialize());

// use routes here ...
app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);


app.use(errorHandler);
// Start the server
app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}`);
});

export default app;