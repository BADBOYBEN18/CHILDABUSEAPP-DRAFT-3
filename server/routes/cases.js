import express from 'express';
import Case from '../models/Case.js';
import { authorizeRoles, isCaseAssignee } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/cases
// @desc    Get all cases (filtered by user role)
// @access  Private
router.get('/', async (req, res) => {
  try {
    let query = {};

    // Filter cases based on user role
    if (req.user.role === 'case_worker') {
      // Case workers can only see their assigned cases
      query.assignedTo = req.user.id;
    } else if (req.user.role === 'supervisor') {
      // Supervisors can see cases they supervise
      query.supervisor = req.user.id;
    }
    // Admins can see all cases (no query filter)

    const cases = await Case.find(query)
      .populate('assignedTo', 'name email')
      .populate('supervisor', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/cases
// @desc    Create a new case
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      status,
      priority,
      dateReported,
      dateOfIncident,
      location,
      summary,
      assignedTo,
      supervisor,
    } = req.body;

    // Validate required fields
    if (!location || !summary || !assignedTo || !supervisor) {
      return res.status(400).json({
        message:
          'Missing required fields: location, summary, assignedTo, and supervisor are required',
      });
    }

    const newCase = new Case({
      status: status || 'intake',
      priority: priority || 'medium',
      dateReported: dateReported || Date.now(),
      dateOfIncident: dateOfIncident || null,
      location,
      summary,
      assignedTo,
      supervisor,
      createdBy: req.user.id,
    });

    const savedCase = await newCase.save();

    // Populate the saved case with user details
    const populatedCase = await Case.findById(savedCase._id)
      .populate('assignedTo', 'name email')
      .populate('supervisor', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedCase);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/cases/:id
// @desc    Get case by ID
// @access  Private
router.get('/:id', isCaseAssignee, async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate('assignedTo', 'name email position department')
      .populate('supervisor', 'name email position department')
      .populate('createdBy', 'name email')
      .populate({
        path: 'children',
        select: 'firstName lastName dateOfBirth gender safetyStatus risk',
      })
      .populate({
        path: 'reporters',
        select: 'firstName lastName relationship contactInfo anonymous',
      })
      .populate({
        path: 'involvedParties',
        select: 'firstName lastName relationship role contactInfo',
      })
      .populate({
        path: 'interventions',
        select:
          'type description status startDate endDate responsibleParty outcome',
      })
      .populate({
        path: 'evidences',
        select:
          'title description type source dateCollected collectedBy fileUrl',
      })
      .populate({
        path: 'notes',
        select: 'note author isConfidential createdAt',
        populate: {
          path: 'author',
          select: 'name position',
        },
      });

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.status(200).json(caseItem);
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/cases/:id
// @desc    Update case
// @access  Private
router.put('/:id', isCaseAssignee, async (req, res) => {
  try {
    const {
      status,
      priority,
      dateReported,
      dateOfIncident,
      location,
      summary,
      assignedTo,
      supervisor,
    } = req.body;

    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Update fields
    caseItem.status = status || caseItem.status;
    caseItem.priority = priority || caseItem.priority;
    caseItem.dateReported = dateReported || caseItem.dateReported;
    caseItem.dateOfIncident = dateOfIncident || caseItem.dateOfIncident;
    caseItem.location = location || caseItem.location;
    caseItem.summary = summary || caseItem.summary;
    caseItem.assignedTo = assignedTo || caseItem.assignedTo;
    caseItem.supervisor = supervisor || caseItem.supervisor;

    const updatedCase = await caseItem.save();

    // Populate the updated case
    const populatedCase = await Case.findById(updatedCase._id)
      .populate('assignedTo', 'name email')
      .populate('supervisor', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json(populatedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/cases/:id
// @desc    Delete case
// @access  Private/Admin
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    await Case.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Case removed' });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
