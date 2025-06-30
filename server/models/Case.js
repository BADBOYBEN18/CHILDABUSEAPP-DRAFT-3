import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: [
      'intake', 
      'assessment', 
      'investigation', 
      'case_planning', 
      'intervention', 
      'monitoring', 
      'closed'
    ],
    default: 'intake'
  },
  priority: {
    type: String,
    enum: ['emergency', 'urgent', 'high', 'medium', 'low'],
    default: 'medium'
  },
  dateReported: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateOfIncident: {
    type: Date
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for related collections
caseSchema.virtual('children', {
  ref: 'Child',
  localField: '_id',
  foreignField: 'case'
});

caseSchema.virtual('reporters', {
  ref: 'Reporter',
  localField: '_id',
  foreignField: 'case'
});

caseSchema.virtual('involvedParties', {
  ref: 'InvolvedParty',
  localField: '_id',
  foreignField: 'case'
});

caseSchema.virtual('interventions', {
  ref: 'Intervention',
  localField: '_id',
  foreignField: 'case'
});

caseSchema.virtual('evidences', {
  ref: 'Evidence',
  localField: '_id',
  foreignField: 'case'
});

caseSchema.virtual('notes', {
  ref: 'CaseNote',
  localField: '_id',
  foreignField: 'case'
});

// Auto-generate case number
caseSchema.pre('save', async function(next) {
  if (this.isNew && !this.caseNumber) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      
      // Find the highest case number for this year
      const highestCase = await this.constructor.findOne({
        caseNumber: { $regex: `^CPS-${year}-` }
      }).sort({ caseNumber: -1 }).exec();
      
      let number = 1;
      if (highestCase && highestCase.caseNumber) {
        const parts = highestCase.caseNumber.split('-');
        if (parts.length === 3) {
          const lastNumber = parseInt(parts[2]);
          if (!isNaN(lastNumber)) {
            number = lastNumber + 1;
          }
        }
      }
      
      // Format the case number with padding
      this.caseNumber = `CPS-${year}-${number.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating case number:', error);
      return next(error);
    }
  }
  next();
});

const Case = mongoose.model('Case', caseSchema);

export default Case;