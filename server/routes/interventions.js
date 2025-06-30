import express from 'express';
import Intervention from '../models/Intervention.js';
import Case from '../models/Case.js';

const router = express.Router();

// @route   GET /api/interventions
// @desc    Get all interventions (filtered by user's cases)
// @access  Private
router.get('/', async (req, res) => {
  try {
    let caseIds = [];
    
    // Get cases the user has access to
    if (req.user.role === 'admin') {
      // Admins can see all interventions
      const allCases = await Case.find().select('_id');
      caseIds = allCases.map(c => c._id);
    } else if (req.user.role === 'supervisor') {
      // Supervisors can see interventions in cases they supervise
      const supervisorCases = await Case.find({ supervisor: req.user.id }).select('_id');
      caseIds = supervisorCases.map(c => c._id);
    } else {
      // Case workers can only see interventions in their assigned cases
      const assignedCases = await Case.find({ assignedTo: req.user.id }).select('_id');
      caseIds = assignedCases.map(c => c._id);
    }
    
    // Find interventions in those cases
    const interventions = await Intervention.find({ case: { $in: caseIds } })
      .populate('case', 'caseNumber')
      .populate('responsibleParty', 'name email position');
    
    res.status(200).json(interventions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/interventions
// @desc    Create a new intervention
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      type,
      description,
      status,
      startDate,
      endDate,
      responsibleParty,
      outcome,
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
        message: 'You do not have permission to add an intervention to this case' 
      });
    }
    
    const newIntervention = new Intervention({
      type,
      description,
      status,
      startDate,
      endDate,
      responsibleParty,
      outcome,
      case: caseId
    });
    
    const savedIntervention = await newIntervention.save();
    
    res.status(201).json(savedIntervention);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/interventions/:id
// @desc    Get intervention by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id)
      .populate('case', 'caseNumber status priority')
      .populate('responsibleParty', 'name email position');
    
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found' });
    }
    
    // Check if user has access to this intervention's case
    const caseItem = await Case.findById(intervention.case);
    
    if (
      caseItem.assignedTo.toString() !== req.user.id && 
      caseItem.supervisor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to view this intervention' 
      });
    }
    
    res.status(200).json(intervention);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/interventions/:id
// @desc    Update intervention
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      type,
      description,
      status,
      startDate,
      endDate,
      responsibleParty,
      outcome
    } = req.body;
    
    const intervention = await Intervention.findById(req.params.id);
    
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found' });
    }
    
    // Check if user has access to this intervention's case
    const caseItem = await Case.findById(intervention.case);
    
    if (
      caseItem.assignedTo.toString() !== req.user.id && 
      caseItem.supervisor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to update this intervention' 
      });
    }
    
    // Update fields
    intervention.type = type || intervention.type;
    intervention.description = description || intervention.description;
    intervention.status = status || intervention.status;
    intervention.startDate = startDate || intervention.startDate;
    intervention.endDate = endDate || intervention.endDate;
    intervention.responsibleParty = responsibleParty || intervention.responsibleParty;
    intervention.outcome = outcome || intervention.outcome;
    
    const updatedIntervention = await intervention.save();
    
    res.status(200).json(updatedIntervention);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;