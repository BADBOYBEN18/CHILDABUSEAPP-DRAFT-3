import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { User, CasePriority, CaseStatus } from '../../types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NewCaseForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    priority: 'medium' as CasePriority,
    dateReported: new Date().toISOString().split('T')[0],
    dateOfIncident: '',
    location: '',
    summary: '',
    assignedTo: '',
    supervisor: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>(`${API_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load team members. Please refresh the page.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.location.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    if (!formData.summary.trim()) {
      setError('Case summary is required');
      setLoading(false);
      return;
    }

    if (!formData.assignedTo) {
      setError('Please assign a case worker');
      setLoading(false);
      return;
    }

    if (!formData.supervisor) {
      setError('Please assign a supervisor');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        dateOfIncident: formData.dateOfIncident || null,
      };

      const response = await axios.post(`${API_URL}/cases`, submitData);

      // Navigate to cases list with success message
      navigate('/cases', {
        state: {
          message: `Case ${response.data.caseNumber} created successfully!`,
        },
      });
    } catch (err: any) {
      console.error('Error creating case:', err);
      setError(
        err.response?.data?.message ||
          'Failed to create case. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const caseWorkers = users.filter((user) => user.role === 'case_worker');
  const supervisors = users.filter((user) => user.role === 'supervisor');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/cases')}
            className="btn btn-outline flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Create New Case
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Enter case details and assign to appropriate team members
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-error-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-error-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-error-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card border border-neutral-100">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">
            Case Information
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="priority" className="form-label">
                Priority Level *
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label htmlFor="dateReported" className="form-label">
                Date Reported *
              </label>
              <input
                type="date"
                id="dateReported"
                name="dateReported"
                required
                value={formData.dateReported}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="dateOfIncident" className="form-label">
                Date of Incident
              </label>
              <input
                type="date"
                id="dateOfIncident"
                name="dateOfIncident"
                value={formData.dateOfIncident}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="location" className="form-label">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location where incident occurred"
                className="form-input"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="summary" className="form-label">
              Case Summary *
            </label>
            <textarea
              id="summary"
              name="summary"
              required
              rows={4}
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Provide a detailed summary of the reported incident..."
              className="form-input"
            />
          </div>
        </div>

        <div className="card border border-neutral-100">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">
            Case Assignment
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="assignedTo" className="form-label">
                Assigned Case Worker *
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                required
                value={formData.assignedTo}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select a case worker</option>
                {caseWorkers.map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} - {worker.department}
                  </option>
                ))}
              </select>
              {caseWorkers.length === 0 && (
                <p className="mt-1 text-sm text-warning-600">
                  No case workers available. Please add team members first.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="supervisor" className="form-label">
                Supervising Manager *
              </label>
              <select
                id="supervisor"
                name="supervisor"
                required
                value={formData.supervisor}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select a supervisor</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor._id} value={supervisor._id}>
                    {supervisor.name} - {supervisor.department}
                  </option>
                ))}
              </select>
              {supervisors.length === 0 && (
                <p className="mt-1 text-sm text-warning-600">
                  No supervisors available. Please add team members first.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              loading || caseWorkers.length === 0 || supervisors.length === 0
            }
            className="btn btn-primary flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating Case...' : 'Create Case'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCaseForm;
