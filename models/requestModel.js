const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
  requesterName: {
    type: String,
    required: [true, 'Requester name is required'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'],
    required: [true, 'Blood Group is required'],
  },
  units: {
    type: Number,
    required: [true, 'Number of units required is necessary'],
    min: [1, 'At least 1 unit is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
  },
  contactEmail: {
    type: String,
    required: [true, 'Email address is required'],
    match: [/\S+@\S+\.\S+/, 'Email format is invalid'],
  },
  urgency: {
    type: String,
    enum: ['Immediate', 'Within 24 hours', 'Within 3 days', 'Within a week'],
    default: 'Within 24 hours',
  },
  hospital: {
    type: String,
    required: false,
  },
  additionalInfo: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['Active', 'Fulfilled', 'Cancelled'],
    default: 'Active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'User reference is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {"strict": "throw"});

// Update the updatedAt field on every save
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a model
const RequestModel = mongoose.model('bloodRequest', requestSchema);

// Export the model
module.exports = RequestModel; 