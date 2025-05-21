const express = require('express');
const donationApp = express.Router();
const DonationModel = require('../models/donationModel');
const AppointmentModel = require('../models/appointmentModel');
const expressAsyncHandler = require('express-async-handler');
const verifyToken = require('../middlewares/verifyToken');

// Add body parser middleware
donationApp.use(express.json());

// Get donation history for the logged in user
donationApp.get(
  '/history',
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      // Find all donations for the user
      const donations = await DonationModel.find({ userId: req.userId })
        .sort({ date: -1 }); // Sort by date descending (newest first)
      
      // Send response
      res.send({
        message: "Donation history fetched successfully",
        error: false,
        payload: donations
      });
    } catch (err) {
      console.error('Error fetching donation history:', err);
      res.status(500).send({
        error: true,
        message: "Server error occurred while fetching donation history"
      });
    }
  })
);

// Add a new donation record
donationApp.post(
  '/record',
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      // Get donation data
      const donationData = req.body;
      
      // Add user ID from token
      donationData.userId = req.userId;
      
      // Create donation document
      const donationDocument = new DonationModel(donationData);
      
      // Save to database
      const dbRes = await donationDocument.save();
      
      // Send response
      res.status(201).send({
        message: "Donation recorded successfully",
        error: false,
        payload: dbRes
      });
    } catch (err) {
      // Handle validation errors
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(error => error.message);
        let errorMessage = "Validation failed: " + validationErrors.join(", ");
        
        return res.status(400).send({
          error: true,
          message: errorMessage
        });
      }
      
      // Handle other errors
      res.status(500).send({
        error: true,
        message: "Server error occurred while recording donation"
      });
    }
  })
);

// Get all appointments for the logged in user
donationApp.get(
  '/appointments',
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      // Find all upcoming appointments for the user
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const appointments = await AppointmentModel.find({
        userId: req.userId,
        date: { $gte: today },
        status: 'Scheduled'
      }).sort({ date: 1 }); // Sort by date ascending (earliest first)
      
      // Send response
      res.send({
        message: "Appointments fetched successfully",
        error: false,
        payload: appointments
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      res.status(500).send({
        error: true,
        message: "Server error occurred while fetching appointments"
      });
    }
  })
);

// Schedule a new appointment
donationApp.post(
  '/appointments',
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      // Get appointment data
      const appointmentData = req.body;
      
      // Add user ID from token
      appointmentData.userId = req.userId;
      
      // Create appointment document
      const appointmentDocument = new AppointmentModel(appointmentData);
      
      // Save to database
      const dbRes = await appointmentDocument.save();
      
      // Send response
      res.status(201).send({
        message: "Appointment scheduled successfully",
        error: false,
        payload: dbRes
      });
    } catch (err) {
      // Handle validation errors
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(error => error.message);
        let errorMessage = "Validation failed: " + validationErrors.join(", ");
        
        return res.status(400).send({
          error: true,
          message: errorMessage
        });
      }
      
      // Handle other errors
      res.status(500).send({
        error: true,
        message: "Server error occurred while scheduling appointment"
      });
    }
  })
);

// Cancel an appointment
donationApp.delete(
  '/appointments/:id',
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      const appointmentId = req.params.id;
      
      // Find the appointment
      const appointment = await AppointmentModel.findById(appointmentId);
      
      // Check if appointment exists
      if (!appointment) {
        return res.status(404).send({
          error: true,
          message: "Appointment not found"
        });
      }
      
      // Check if the appointment belongs to the logged in user
      if (appointment.userId.toString() !== req.userId) {
        return res.status(403).send({
          error: true,
          message: "You are not authorized to cancel this appointment"
        });
      }
      
      // Set status to cancelled
      appointment.status = 'Cancelled';
      await appointment.save();
      
      // Send response
      res.send({
        message: "Appointment cancelled successfully",
        error: false,
        payload: appointment
      });
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      res.status(500).send({
        error: true,
        message: "Server error occurred while cancelling appointment"
      });
    }
  })
);

module.exports = donationApp; 