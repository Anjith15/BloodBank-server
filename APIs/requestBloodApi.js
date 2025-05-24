const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/request-blood', async (req, res) => {
  const { name, email, bloodType, city, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'testmailvnr15@gmail.com',
        pass: 'ifgh pobj hevw bdvi',
      },
    });

    const mailOptions = {
      from: 'testmailvnr15@gmail.com',
      to: 'testmailvnr15@gmail.com',
      subject: `Blood Request: ${bloodType} in ${city}`,
      text: `
        Name: ${name}
        Email: ${email}
        Blood Type: ${bloodType}
        City: ${city}
        Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Request sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send request' });
  }
});

module.exports = router;
