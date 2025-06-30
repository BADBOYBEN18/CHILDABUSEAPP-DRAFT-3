import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'photo', 
      'video', 
      'audio', 
      'document', 
      'medical_record', 
      'school_record', 
      'interview', 
      'observation', 
      'other'
    ],
    required: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  dateCollected: {
    type: Date,
    required: true,
    default: Date.now
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
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

const Evidence = mongoose.model('Evidence', evidenceSchema);

export default Evidence;