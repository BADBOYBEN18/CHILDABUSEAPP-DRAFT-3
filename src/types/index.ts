// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  position: string;
  department: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'case_worker' | 'supervisor' | 'law_enforcement' | 'medical' | 'legal';

export interface UserCredentials {
  email: string;
  password: string;
}

// Case Types
export interface Case {
  _id: string;
  caseNumber: string;
  status: CaseStatus;
  priority: CasePriority;
  dateReported: string;
  dateOfIncident?: string;
  location: string;
  summary: string;
  assignedTo: string | User;
  supervisor: string | User;
  children: Child[];
  reporters: Reporter[];
  involvedParties: InvolvedParty[];
  interventions: Intervention[];
  evidences: Evidence[];
  notes: CaseNote[];
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export type CaseStatus = 
  | 'intake' 
  | 'assessment' 
  | 'investigation' 
  | 'case_planning' 
  | 'intervention' 
  | 'monitoring' 
  | 'closed';

export type CasePriority = 'emergency' | 'urgent' | 'high' | 'medium' | 'low';

// Child Types
export interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  currentAddress?: string;
  currentCaregivers?: string;
  school?: string;
  medicalInformation?: string;
  safetyStatus: ChildSafetyStatus;
  risk: RiskLevel;
  specialNeeds?: string[];
  case: string | Case;
  createdAt: string;
  updatedAt: string;
}

export type ChildSafetyStatus = 'safe' | 'at_risk' | 'immediate_danger' | 'unknown';
export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low' | 'unknown';

// Reporter Types
export interface Reporter {
  _id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  contactInfo: string;
  anonymous: boolean;
  case: string | Case;
  createdAt: string;
  updatedAt: string;
}

// Involved Party Types
export interface InvolvedParty {
  _id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  role: InvolvedPartyRole;
  contactInfo?: string;
  address?: string;
  notes?: string;
  case: string | Case;
  createdAt: string;
  updatedAt: string;
}

export type InvolvedPartyRole = 
  | 'alleged_perpetrator' 
  | 'parent' 
  | 'guardian' 
  | 'sibling' 
  | 'extended_family' 
  | 'witness' 
  | 'other';

// Intervention Types
export interface Intervention {
  _id: string;
  type: InterventionType;
  description: string;
  status: InterventionStatus;
  startDate: string;
  endDate?: string;
  responsibleParty: string | User;
  outcome?: string;
  case: string | Case;
  createdAt: string;
  updatedAt: string;
}

export type InterventionType = 
  | 'safety_plan' 
  | 'removal_from_home' 
  | 'family_support' 
  | 'counseling' 
  | 'medical_treatment' 
  | 'legal_action' 
  | 'educational_support' 
  | 'other';

export type InterventionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

// Evidence Types
export interface Evidence {
  _id: string;
  title: string;
  description: string;
  type: EvidenceType;
  source: string;
  dateCollected: string;
  collectedBy: string | User;
  fileUrl?: string;
  case: string | Case;
  createdAt: string;
  updatedAt: string;
}

export type EvidenceType = 
  | 'photo' 
  | 'video' 
  | 'audio' 
  | 'document' 
  | 'medical_record' 
  | 'school_record' 
  | 'interview' 
  | 'observation' 
  | 'other';

// Case Note Types
export interface CaseNote {
  _id: string;
  note: string;
  author: string | User;
  isConfidential: boolean;
  case: string | Case;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
}