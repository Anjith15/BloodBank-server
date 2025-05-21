const nodemailer = require('nodemailer');

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com', // Use environment variable or default
    pass: process.env.GMAIL_APP_PASSWORD || 'your-email-password', // Use environment variable or default
  },
});

/**
 * Send email to notify donors about a blood request
 * @param {Array} donors - Array of donor objects with email addresses
 * @param {Object} requestDetails - Details of the blood request
 * @returns {Promise} - Promise that resolves when all emails are sent
 */
const sendBloodRequestEmails = async (donors, requestDetails) => {
  try {
    // Extract request details
    const { requesterName, bloodGroup, location, contactNumber, urgency, additionalInfo } = requestDetails;
    
    // Create email options
    const mailOptions = {
      from: process.env.GMAIL_USER || 'your-email@gmail.com',
      subject: `Urgent Blood Request: ${bloodGroup} Blood Needed`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #D32F2F; text-align: center; margin-bottom: 20px;">Urgent Blood Request</h2>
          <p>Hello Donor,</p>
          <p>There is an urgent blood request that matches your blood type. Your donation could save a life!</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Requester:</strong> ${requesterName}</p>
            <p><strong>Blood Group Needed:</strong> ${bloodGroup}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Contact Number:</strong> ${contactNumber}</p>
            <p><strong>Urgency Level:</strong> ${urgency}</p>
            <p><strong>Additional Information:</strong> ${additionalInfo || 'None provided'}</p>
          </div>
          <p>If you are available to donate, please contact the requester directly or reply to this email.</p>
          <p>Thank you for your generosity!</p>
          <div style="text-align: center; margin-top: 30px; color: #777;">
            <p>This is an automated message from LifeDrop Blood Bank System.</p>
          </div>
        </div>
      `,
    };
    
    // Send emails to all donors
    const emailPromises = donors.map(donor => {
      const personalizedOptions = { ...mailOptions, to: donor.email };
      return transporter.sendMail(personalizedOptions);
    });
    
    // Wait for all emails to be sent
    await Promise.all(emailPromises);
    
    console.log(`Blood request notification sent to ${donors.length} donors`);
    return { success: true, message: 'Notifications sent successfully' };
  } catch (error) {
    console.error('Error sending blood request emails:', error);
    return { success: false, message: 'Failed to send notifications', error };
  }
};

module.exports = {
  sendBloodRequestEmails
}; 