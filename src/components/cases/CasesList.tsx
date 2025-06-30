import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, AlertTriangle, Clock } from 'lucide-react';
import { Case, CasePriority, CaseStatus } from '../../types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CasesListProps {
  cases: Case[];
  loading: boolean;
  onRefresh: () => void;
}

const CasesList: React.FC<CasesListProps> = ({ cases, loading, onRefresh }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | 'all'>('all');

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch = caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || caseItem.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateCase = () => {
    navigate('/cases/new');
  };

  const getPriorityBadge = (priority: CasePriority) => {
    switch (priority) {
      case 'emergency':
        return (
          <span className="badge badge-red flex items-center">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Emergency
          </span>
        );
      case 'urgent':
        return <span className="badge badge-yellow">Urgent</span>;
      case 'high':
        return <span className="badge badge-yellow">High</span>;
      case 'medium':
        return <span className="badge badge-blue">Medium</span>;
      case 'low':
        return <span className="badge badge-green">Low</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'intake':
        return <span className="badge badge-blue">Intake</span>;
      case 'assessment':
        return <span className="badge badge-blue">Assessment</span>;
      case 'investigation':
        return (
          <span className="badge badge-yellow flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            Investigation
          </span>
        );
      case 'case_planning':
        return <span className="badge badge-blue">Case Planning</span>;
      case 'intervention':
        return <span className="badge badge-teal">Intervention</span>;
      case 'monitoring':
        return <span className="badge badge-teal">Monitoring</span>;
      case 'closed':
        return <span className="badge badge-green">Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Cases</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage and track all case records
          </p>
        </div>
        <button
          onClick={handleCreateCase}
          className="btn btn-primary flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search cases..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-neutral-400" />
            </div>
            <select
              className="form-input pl-10 pr-10 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="intake">Intake</option>
              <option value="assessment">Assessment</option>
              <option value="investigation">Investigation</option>
              <option value="case_planning">Case Planning</option>
              <option value="intervention">Intervention</option>
              <option value="monitoring">Monitoring</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AlertTriangle className="h-5 w-5 text-neutral-400" />
            </div>
            <select
              className="form-input pl-10 pr-10 appearance-none"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as CasePriority | 'all')}
            >
              <option value="all">All Priorities</option>
              <option value="emergency">Emergency</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases list */}
      <div className="card border border-neutral-100">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-sm text-neutral-500">Loading cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-neutral-500">No cases found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Case #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Reported Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredCases.map((caseItem) => (
                  <tr 
                    key={caseItem._id} 
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/cases/${caseItem._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      {caseItem.caseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(caseItem.dateReported).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(caseItem.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(caseItem.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {caseItem.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {typeof caseItem.assignedTo === 'string' 
                        ? caseItem.assignedTo 
                        : caseItem.assignedTo.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesList;