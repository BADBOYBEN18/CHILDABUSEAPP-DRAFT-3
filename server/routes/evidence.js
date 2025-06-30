import express from 'express';
import Evidence from '../models/Evidence.js';
import Case from '../models/Case.js';

const router = express.Router();

// @route   GET /api/evidence
// @desc    Get all evidence (filtered by user's cases)
// @access  Private
router.get('/', async (req, res) => {
  try {
    let caseIds = [];
    
    // Get cases the user has access to
    if (req.user.role === 'admin') {
      // Admins can see all evidence
      const allCases = await Case.find().select('_id');
      caseIds = allCases.map(c => c._id);
    } else if (req.user.role === 'supervisor') {
      // Supervisors can see evidence in cases they supervise
      const supervisorCases = await Case.find({ supervisor: req.user.id }).select('_id');
      caseIds = supervisorCases.map(c => c._id);
    } else {
      // Case workers can only see evidence in their assigned cases
      const assignedCases = await Case.find({ assignedTo: req.user.id }).select('_id');
      caseIds = assignedCases.map(c => c._id);
    }
    
    // Find evidence in those cases
    const evidences = await Evidence.find({ case: { $in: caseIds } })
      .populate('case', 'caseNumber')
      .populate('collectedBy', 'name position');
    
    res.status(200).json(evidences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/evidence
// @desc    Add evidence to a case
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      source,
      dateCollected,
      collectedBy,
      fileUrl,
      caseId
    } = req.body;
    
    // Check if user has access to the case
    const caseItem = await Case.findById(caseId);
    
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    // Check if user is assigned to the case or is a supervisor or admin
    if (
      caseItem.assignedTo.toString() !== req.user.id && 
      caseItem.supervisor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to add evidence to this case' 
      });
    }
    
    const newEvidence = new Evidence({
      title,
      description,
      type,
      source,
      dateCollected: dateCollected || Date.now(),
      collectedBy: collectedBy || req.user.id,
      fileUrl,
      case: caseId
    });
    
    const savedEvidence = await newEvidence.save();
    
    res.status(201).json(savedEvidence);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/evidence/:id
// @desc    Get evidence by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('case', 'caseNumber status priority')
      .populate('collectedBy', 'name position');
    
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }
    
    // Check if user has access to this evidence's case
    const caseItem = await Case.findById(evidence.case);
    
    if (
      caseItem.assignedTo.toString() !== req.user.id && 
      caseItem.supervisor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to view this evidence' 
      });
    }
    
    res.status(200).json(evidence);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/evidence/:id
// @desc    Update evidence
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      source,
      dateCollected,
      fileUrl
    } = req.body;
    
    const evidence = await Evidence.findById(req.params.id);
    
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }
    
    // Check if user has access to this evidence's case
    const caseItem = await Case.findById(evidence.case);
    
    if (
      caseItem.assignedTo.toString() !== req.user.id && 
      caseItem.supervisor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to update this evidence' 
      });
    }
    
    // Update fields
    evidence.title = title || evidence.title;
    evidence.description = description || evidence.description;
    evidence.type = type || evidence.type;
    evidence.source = source || evidence.source;
    evidence.dateCollected = dateCollected || evidence.dateCollected;
    evidence.fileUrl = fileUrl || evidence.fileUrl;
    
    const updatedEvidence = await evidence.save();
    
    res.status(200).json(updatedEvidence);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;