const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'User reference is required'],
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
  },
  center: {
    type: String,
    required: [true, 'Donation center name is required'],
  },
  address: {
    type: String,
    required: [true, 'Donation center address is required'],
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {"strict": "throw"});

// Create a model
const AppointmentModel = mongoose.model('appointment', appointmentSchema);

// Export the model
module.exports = AppointmentModel; 