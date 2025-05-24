const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const UserModel = require("./models/userModel");

// Middleware
app.use(cors());
app.use(express.json()); // Handles JSON request bodies

app.post('/request-blood', async (req, res) => {
  const { bloodType, city, message } = req.body;

  if (!bloodType || !city || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Find all donors with matching blood type
    const matchingDonors = await UserModel.find({ bloodGroup: bloodType });

    if (!matchingDonors || matchingDonors.length === 0) {
      return res.status(404).json({ error: 'No matching donors found.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'testmailvnr15@gmail.com',
        pass: process.env.GMAIL_PASS
      },
    });

    // Format current date and time
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Send email to admin
    const adminMailOptions = {
      from: process.env.GMAIL_USER || 'testmailvnr15@gmail.com',
      to: process.env.GMAIL_USER || 'testmailvnr15@gmail.com',
      subject: `🚨 Urgent Blood Request: ${bloodType} needed in ${city}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D32F2F;">New Blood Request Received</h2>
          <p style="color: #666;">A new blood request has been received through the LifeDrop Blood Bank system.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #D32F2F; margin-top: 0;">Request Details</h3>
            <p><strong>Blood Type Required:</strong> ${bloodType}</p>
            <p><strong>Location:</strong> ${city}</p>
            <p><strong>Request Time:</strong> ${currentTime}</p>
            <p><strong>Request Date:</strong> ${currentDate}</p>
            <p><strong>Message from Requester:</strong><br>${message}</p>
          </div>

          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Matching Donors</h3>
            <p>Number of matching donors found: <strong>${matchingDonors.length}</strong></p>
            <p>Donor Details:</p>
            <ul>
              ${matchingDonors.map(donor => `
                <li>
                  ${donor.username} (${donor.city})
                  <br>Contact: ${donor.phoneNumber}
                  <br>Email: ${donor.email}
                </li>
              `).join('')}
            </ul>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from LifeDrop Blood Bank System.
            <br>Please monitor the situation and follow up if necessary.
          </p>
        </div>
      `
    };

    // Send emails to all matching donors
    const emailPromises = matchingDonors.map(donor => {
      const donorMailOptions = {
        from: process.env.GMAIL_USER || 'testmailvnr15@gmail.com',
        to: donor.email,
        subject: `🩸 Urgent Blood Request: ${bloodType} needed in ${city}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #D32F2F;">Urgent Blood Request</h2>
            <p>Dear ${donor.username},</p>
            
            <p>We hope this email finds you well. There is an urgent requirement for <strong>${bloodType}</strong> blood in your area.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #D32F2F; margin-top: 0;">Request Details</h3>
              <p><strong>Blood Type Needed:</strong> ${bloodType}</p>
              <p><strong>Location:</strong> ${city}</p>
              <p><strong>Request Time:</strong> ${currentTime}</p>
              <p><strong>Request Date:</strong> ${currentDate}</p>
              <p><strong>Additional Information:</strong><br>${message}</p>
            </div>

            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #e65100; margin-top: 0;">Important Information</h3>
              <ul style="padding-left: 20px;">
                <li>Your blood type matches this request</li>
                <li>Please respond to this email if you are available to donate</li>
                <li>The donation process takes approximately 30-45 minutes</li>
                <li>Please bring a valid ID when you come to donate</li>
              </ul>
            </div>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">Benefits of Donating</h3>
              <ul style="padding-left: 20px;">
                <li>One donation can save up to three lives</li>
                <li>Free health screening during donation</li>
                <li>Replenishment of blood cells which helps your body stay healthy</li>
                <li>The satisfaction of helping someone in need</li>
              </ul>
            </div>

            <p style="margin-top: 20px;">
              If you are available to donate, please:
              <br>1. Reply to this email
              <br>2. Call us at: <strong>[Blood Bank Phone Number]</strong>
              <br>3. Visit our center at: <strong>[Blood Bank Address]</strong>
            </p>

            <p><strong>Your contribution can save a life!</strong></p>

            <p>Best regards,<br>LifeDrop Blood Bank Team</p>

            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              This email was sent because you are registered as a blood donor with LifeDrop Blood Bank.
              <br>If you wish to unsubscribe from these notifications, please log in to your account and update your preferences.
            </p>
          </div>
        `
      };
      return transporter.sendMail(donorMailOptions);
    });

    await transporter.sendMail(adminMailOptions);
    await Promise.all(emailPromises);

    res.json({ 
      success: true, 
      msg: 'Request sent successfully.',
      donorsNotified: matchingDonors.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

// Import API routes
const userApp = require("./APIs/userApi");
const requestApp = require("./APIs/requestApi");
const donationApp = require("./APIs/donationApi");

// Use API routes
app.use("/user-api", userApp);
app.use("/request-api", requestApp);
app.use("/donation-api", donationApp);

// Root route
app.get("/", (req, res) => {
  res.send({
    message: "LifeDrop Blood Bank API is running",
    version: "1.0.0",
    endpoints: {
      users: "/user-api",
      requests: "/request-api",
      donations: "/donation-api"
    }
  });
});

// Port config
const port = process.env.PORT || 3001;

// DB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(port, () =>
      console.log(`🚀 Server is running on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
  });
