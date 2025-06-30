import mongoose from 'mongoose';

const interventionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'safety_plan', 
      'removal_from_home', 
      'family_support', 
      'counseling', 
      'medical_treatment', 
      'legal_action', 
      'educational_support', 
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  responsibleParty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  outcome: {
    type: String,
    trim: true
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  }
}, {
  timestamps: true
});

const Intervention = mongoose.model('Intervention', interventionSchema);

export default Intervention;