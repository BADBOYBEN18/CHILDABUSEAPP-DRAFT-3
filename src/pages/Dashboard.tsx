import React, { useState, useEffect } from 'react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import { Case } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Mock data - would be replaced with API calls
const mockCases: Case[] = [
  {
    _id: '1',
    caseNumber: 'CPS-2023-001',
    status: 'investigation',
    priority: 'high',
    dateReported: '2023-11-15T08:30:00.000Z',
    location: 'Springfield, IL',
    summary: 'Report of physical abuse from school teacher',
    assignedTo: { _id: '101', name: 'John Smith', email: 'john@example.com', role: 'case_worker', position: 'Case Worker', department: 'Intake', createdAt: '', updatedAt: '' },
    supervisor: { _id: '102', name: 'Mary Johnson', email: 'mary@example.com', role: 'supervisor', position: 'Supervisor', department: 'Intake', createdAt: '', updatedAt: '' },
    children: [],
    reporters: [],
    involvedParties: [],
    interventions: [],
    evidences: [],
    notes: [],
    createdBy: { _id: '103', name: 'Reception', email: 'reception@example.com', role: 'admin', position: 'Admin', department: 'Administration', createdAt: '', updatedAt: '' },
    createdAt: '2023-11-15T08:30:00.000Z',
    updatedAt: '2023-11-16T10:15:00.000Z'
  },
  {
    _id: '2',
    caseNumber: 'CPS-2023-002',
    status: 'intake',
    priority: 'emergency',
    dateReported: '2023-11-16T14:45:00.000Z',
    location: 'Chicago, IL',
    summary: 'Hotline report of child abandonment',
    assignedTo: { _id: '104', name: 'Sarah Williams', email: 'sarah@example.com', role: 'case_worker', position: 'Case Worker', department: 'Intake', createdAt: '', updatedAt: '' },
    supervisor: { _id: '102', name: 'Mary Johnson', email: 'mary@example.com', role: 'supervisor', position: 'Supervisor', department: 'Intake', createdAt: '', updatedAt: '' },
    children: [],
    reporters: [],
    involvedParties: [],
    interventions: [],
    evidences: [],
    notes: [],
    createdBy: { _id: '103', name: 'Reception', email: 'reception@example.com', role: 'admin', position: 'Admin', department: 'Administration', createdAt: '', updatedAt: '' },
    createdAt: '2023-11-16T14:45:00.000Z',
    updatedAt: '2023-11-16T15:30:00.000Z'
  },
  {
    _id: '3',
    caseNumber: 'CPS-2023-003',
    status: 'case_planning',
    priority: 'medium',
    dateReported: '2023-11-10T09:15:00.000Z',
    location: 'Aurora, IL',
    summary: 'Neglect reported by neighbor',
    assignedTo: { _id: '101', name: 'John Smith', email: 'john@example.com', role: 'case_worker', position: 'Case Worker', department: 'Intake', createdAt: '', updatedAt: '' },
    supervisor: { _id: '105', name: 'Robert Chen', email: 'robert@example.com', role: 'supervisor', position: 'Supervisor', department: 'Case Management', createdAt: '', updatedAt: '' },
    children: [],
    reporters: [],
    involvedParties: [],
    interventions: [],
    evidences: [],
    notes: [],
    createdBy: { _id: '103', name: 'Reception', email: 'reception@example.com', role: 'admin', position: 'Admin', department: 'Administration', createdAt: '', updatedAt: '' },
    createdAt: '2023-11-10T09:15:00.000Z',
    updatedAt: '2023-11-14T11:20:00.000Z'
  },
  {
    _id: '4',
    caseNumber: 'CPS-2023-004',
    status: 'monitoring',
    priority: 'low',
    dateReported: '2023-11-05T10:30:00.000Z',
    location: 'Peoria, IL',
    summary: 'Follow-up on previous case',
    assignedTo: { _id: '104', name: 'Sarah Williams', email: 'sarah@example.com', role: 'case_worker', position: 'Case Worker', department: 'Intake', createdAt: '', updatedAt: '' },
    supervisor: { _id: '105', name: 'Robert Chen', email: 'robert@example.com', role: 'supervisor', position: 'Supervisor', department: 'Case Management', createdAt: '', updatedAt: '' },
    children: [],
    reporters: [],
    involvedParties: [],
    interventions: [],
    evidences: [],
    notes: [],
    createdBy: { _id: '103', name: 'Reception', email: 'reception@example.com', role: 'admin', position: 'Admin', department: 'Administration', createdAt: '', updatedAt: '' },
    createdAt: '2023-11-05T10:30:00.000Z',
    updatedAt: '2023-11-12T14:10:00.000Z'
  },
  {
    _id: '5',
    caseNumber: 'CPS-2023-005',
    status: 'closed',
    priority: 'medium',
    dateReported: '2023-10-25T13:20:00.000Z',
    location: 'Rockford, IL',
    summary: 'Educational neglect case',
    assignedTo: { _id: '101', name: 'John Smith', email: 'john@example.com', role: 'case_worker', position: 'Case Worker', department: 'Intake', createdAt: '', updatedAt: '' },
    supervisor: { _id: '102', name: 'Mary Johnson', email: 'mary@example.com', role: 'supervisor', position: 'Supervisor', department: 'Intake', createdAt: '', updatedAt: '' },
    children: [],
    reporters: [],
    involvedParties: [],
    interventions: [],
    evidences: [],
    notes: [],
    createdBy: { _id: '103', name: 'Reception', email: 'reception@example.com', role: 'admin', position: 'Admin', department: 'Administration', createdAt: '', updatedAt: '' },
    createdAt: '2023-10-25T13:20:00.000Z',
    updatedAt: '2023-11-15T16:45:00.000Z'
  }
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [stats, setStats] = useState({
    totalActiveCases: 0,
    emergencyCases: 0,
    casesNeedingReview: 0,
    casesClosedThisMonth: 0,
  });

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchDashboardData = () => {
      // Sort cases by reported date (newest first)
      const sortedCases = [...mockCases].sort(
        (a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()
      );
      
      // Take the 5 most recent cases
      setRecentCases(sortedCases.slice(0, 5));
      
      // Calculate stats
      setStats({
        totalActiveCases: mockCases.filter(c => c.status !== 'closed').length,
        emergencyCases: mockCases.filter(c => c.priority === 'emergency').length,
        casesNeedingReview: mockCases.filter(c => 
          c.status === 'intake' || c.status === 'assessment'
        ).length,
        casesClosedThisMonth: mockCases.filter(c => {
          const closedDate = new Date(c.updatedAt);
          const now = new Date();
          return c.status === 'closed' && 
                 closedDate.getMonth() === now.getMonth() && 
                 closedDate.getFullYear() === now.getFullYear();
        }).length,
      });
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      {user && (
        <DashboardOverview recentCases={recentCases} stats={stats} />
      )}
    </div>
  );
};

export default Dashboard;