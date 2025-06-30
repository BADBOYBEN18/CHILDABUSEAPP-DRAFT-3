import mongoose from 'mongoose';

const childSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    trim: true
  },
  currentAddress: {
    type: String,
    trim: true
  },
  currentCaregivers: {
    type: String,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  medicalInformation: {
    type: String,
    trim: true
  },
  safetyStatus: {
    type: String,
    enum: ['safe', 'at_risk', 'immediate_danger', 'unknown'],
    default: 'unknown'
  },
  risk: {
    type: String,
    enum: ['critical', 'high', 'moderate', 'low', 'unknown'],
    default: 'unknown'
  },
  specialNeeds: [{
    type: String,
    trim: true
  }],
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  }
}, {
  timestamps: true
});

const Child = mongoose.model('Child', childSchema);

export default Child;