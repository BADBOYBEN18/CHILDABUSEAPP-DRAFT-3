import express from 'express';
import Child from '../models/Child.js';
import Case from '../models/Case.js';
import { isCaseAssignee } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/children
// @desc    Get all children (filtered by user's cases)
// @access  Private
router.get('/', async (req, res) => {
  try {
    let caseIds = [];
    
    // Get cases the user has access to
    if (req.user.role === 'admin') {
      // Admins can see all children
      const allCases = await Case.find().select('_id');
      caseIds = allCases.map(c => c._id);
    } else if (req.user.role === 'supervisor') {
      // Supervisors can see children in cases they supervise
      const supervisorCases = await Case.find({ supervisor: req.user.id }).select('_id');
      caseIds = supervisorCases.map(c => c._id);
    } else {
      // Case workers can only see children in their assigned cases
      const assignedCases = await Case.find({ assignedTo: req.user.id }).select('_id');
      caseIds = assignedCases.map(c => c._id);
    }
    
    // Find children in those cases
    const children = await Child.find({ case: { $in: caseIds } })
      .populate('case', 'caseNumber status priority');
    
    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/children
// @desc    Add a child to a case
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      currentAddress,
      currentCaregivers,
      school,
      medicalInformation,
      safetyStatus,
      risk,
      specialNeeds,
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
        message: 'You do not have permission to add a child to this case' 
      });
    }
    
    const newChild = new Child({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      currentAddress,
      currentCaregivers,
      school,
      medicalInformation,
      safetyStatus,
      risk,
      specialNeeds,
      case: caseId
    });
    
    const savedChild = await newChild.save();
    
    res.status(201).json(savedChild);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/children/:id
// @desc    Get child by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('case', 'caseNumber status priority assignedTo supervisor');
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Check if user has access to this child's case
    const caseItem = await Case.findById(child.case);
    
    if (
      caseItem.assignedTo.toString() !== req.user.id && 
      caseItem.supervisor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to view this child' 
      });
    }
    
    res.status(200).json(child);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/children/:id
// @desc    Update child
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      currentAddress,
      currentCaregivers,
      school,
      medicalInformation,
      safetyStatus,
      risk,
      specialNeeds
    } = req.body;
    
    const child = await Child.findById(req.params.id);
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Check if user has access to this child's case
    const caseItem = await Case.findById(child.case);
    
    if (
      caseItem.assignedTo.toString() !== req.user.id && 
      caseItem.supervisor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to update this child' 
      });
    }
    
    // Update fields
    child.firstName = firstName || child.firstName;
    child.lastName = lastName || child.lastName;
    child.dateOfBirth = dateOfBirth || child.dateOfBirth;
    child.gender = gender || child.gender;
    child.currentAddress = currentAddress || child.currentAddress;
    child.currentCaregivers = currentCaregivers || child.currentCaregivers;
    child.school = school || child.school;
    child.medicalInformation = medicalInformation || child.medicalInformation;
    child.safetyStatus = safetyStatus || child.safetyStatus;
    child.risk = risk || child.risk;
    child.specialNeeds = specialNeeds || child.specialNeeds;
    
    const updatedChild = await child.save();
    
    res.status(200).json(updatedChild);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;