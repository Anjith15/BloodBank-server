const express = require('express');
const requestApp = express.Router();
const RequestModel = require('../models/requestModel');
const UserModel = require('../models/userModel');
const expressAsyncHandler = require('express-async-handler');
const { sendBloodRequestEmails } = require('../services/emailService');
const verifyToken = require('../middlewares/verifyToken');

// Add body parser middleware
requestApp.use(express.json());

// Create a new blood request
requestApp.post(
  '/create',
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      // Get request details from body
      const requestData = req.body;
      
      // Add user id from token
      requestData.createdBy = req.userId;
      
      // Create a request document
      const requestDocument = new RequestModel(requestData);
      
      // Save to database
      const dbRes = await requestDocument.save();
      
      // Find matching donors based on blood group and city
      const matchingDonors = await UserModel.find({
        bloodGroup: requestData.bloodGroup,
        city: requestData.city
      });
      
      // If there are matching donors, send email notifications
      if (matchingDonors.length > 0) {
        // Send emails to matching donors
        const emailResponse = await sendBloodRequestEmails(matchingDonors, {
          requesterName: requestData.requesterName,
          bloodGroup: requestData.bloodGroup,
          location: `${requestData.city}, ${requestData.state}`,
          contactNumber: requestData.contactNumber,
          urgency: requestData.urgency,
          additionalInfo: requestData.additionalInfo
        });
        
        // Add notification details to response
        dbRes._doc.notificationSent = emailResponse.success;
        dbRes._doc.notifiedDonors = matchingDonors.length;
      } else {
        dbRes._doc.notificationSent = false;
        dbRes._doc.notifiedDonors = 0;
      }
      
      // Send response
      res.status(201).send({ 
        message: "Blood request created successfully", 
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
        message: "Server error occurred while creating blood request"
      });
    }
  })
);

// Get all blood requests
requestApp.get(
  '/all',
  expressAsyncHandler(async (req, res) => {
    try {
      // Get all blood requests
      const requests = await RequestModel.find()
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate('createdBy', 'username email phoneNumber'); // Get user details
      
      // Send response
      res.send({ 
        message: "Blood requests fetched successfully", 
        error: false, 
        payload: requests 
      });
    } catch (err) {
      res.status(500).send({ 
        error: true, 
        message: "Server error occurred while fetching blood requests"
      });
    }
  })
);

// Get blood requests by blood group
requestApp.get(
  '/byBloodGroup/:bloodGroup',
  expressAsyncHandler(async (req, res) => {
    try {
      const { bloodGroup } = req.params;
      
      // Find requests by blood group
      const requests = await RequestModel.find({ 
        bloodGroup,
        status: 'Active'
      })
      .sort({ createdAt: -1 }) 
      .populate('createdBy', 'username email phoneNumber');
      
      // Send response
      res.send({ 
        message: `Blood requests for ${bloodGroup} fetched successfully`, 
        error: false, 
        payload: requests 
      });
    } catch (err) {
      res.status(500).send({ 
        error: true, 
        message: "Server error occurred while fetching blood requests"
      });
    }
  })
);

// Get blood requests by user
requestApp.get(
  '/myRequests',
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      // Find user's requests
      const requests = await RequestModel.find({ createdBy: req.userId })
        .sort({ createdAt: -1 });
      
      // Send response
      res.send({ 
        message: "Your blood requests fetched successfully", 
        error: false, 
        payload: requests 
      });
    } catch (err) {
      res.status(500).send({ 
        error: true, 
        message: "Server error occurred while fetching your blood requests"
      });
    }
  })
);

// Update blood request status
requestApp.put(
  '/updateStatus/:requestId',
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;
      
      // Find request by ID
      const request = await RequestModel.findById(requestId);
      
      // Check if request exists
      if (!request) {
        return res.status(404).send({ 
          error: true, 
          message: "Blood request not found" 
        });
      }
      
      // Check if user is authorized to update the request
      if (request.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
        return res.status(403).send({ 
          error: true, 
          message: "Unauthorized to update this request" 
        });
      }
      
      // Update status
      request.status = status;
      await request.save();
      
      // Send response
      res.send({ 
        message: "Blood request status updated successfully", 
        error: false, 
        payload: request 
      });
    } catch (err) {
      res.status(500).send({ 
        error: true, 
        message: "Server error occurred while updating blood request status"
      });
    }
  })
);

module.exports = requestApp; 