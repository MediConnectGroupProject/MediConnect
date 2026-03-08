import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import os from 'os';

import { errorHandler } from './middleware/errorHandlerMiddleware.js';
import cookieParser from "cookie-parser";
import passport from './config/passport.js';

// import routes here ....
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import pharmacistRoutes from './routes/pharmacistRoutes.js';
import mltRoutes from './routes/mltRoutes.js';
import receptionistRoutes from './routes/receptionistRoutes.js';
import userRoutes from './routes/userRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';



// Load environment variables from .env file
dotenv.config();
const PORT = process.env.SERVER_PORT || 5000;
const app = express();

// middleware setup here ...
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE" ,"PATCH"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser()); 
// use routes here ...
app.use((req, res, next) => {
    // console.log(`DEBUG: Incoming Request: ${req.method} ${req.url}`); // Optional: Keep commented or remove
    next();
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Moved specific route before generic admin api
app.use('/api', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/pharmacist', pharmacistRoutes);
app.use('/api/mlt', mltRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/settings', settingsRoutes);

// Returns the server's LAN IP so the frontend can generate network-accessible QR codes
app.get('/api/network-host', (req, res) => {
  const interfaces = os.networkInterfaces();
  let lanIp = null;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        lanIp = iface.address;
        break;
      }
    }
    if (lanIp) break;
  }
  res.json({ host: lanIp || 'localhost' });
});


app.use(errorHandler);
// Start the server
app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}`);
  console.log("DEBUG: SERVER CODE IS UPDATED AND RUNNING [ID: CHECK_1]");
});

export default app;