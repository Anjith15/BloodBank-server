const mongoose = require('mongoose');

const donationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'User reference is required'],
  },
  date: {
    type: Date,
    required: [true, 'Donation date is required'],
  },
  center: {
    type: String,
    required: [true, 'Donation center name is required'],
  },
  address: {
    type: String,
    required: [true, 'Donation center address is required'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'],
    required: false,
  },
  units: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 unit is required'],
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Cancelled'],
    default: 'Completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {"strict": "throw"});

// Create a model
const DonationModel = mongoose.model('donation', donationSchema);

// Export the model
module.exports = DonationModel; 