import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Case, CasePriority } from '../../types';

interface DashboardOverviewProps {
  recentCases: Case[];
  stats: {
    totalActiveCases: number;
    emergencyCases: number;
    casesNeedingReview: number;
    casesClosedThisMonth: number;
  };
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ recentCases, stats }) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority: CasePriority) => {
    switch (priority) {
      case 'emergency':
        return <span className="badge badge-red">Emergency</span>;
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

  const statCards = [
    {
      title: 'Active Cases',
      value: stats.totalActiveCases,
      icon: <Users className="h-6 w-6 text-primary-500" />,
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
    },
    {
      title: 'Emergency Cases',
      value: stats.emergencyCases,
      icon: <AlertTriangle className="h-6 w-6 text-error-500" />,
      bgColor: 'bg-error-50',
      textColor: 'text-error-700',
    },
    {
      title: 'Needs Review',
      value: stats.casesNeedingReview,
      icon: <Clock className="h-6 w-6 text-warning-500" />,
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-700',
    },
    {
      title: 'Closed This Month',
      value: stats.casesClosedThisMonth,
      icon: <CheckCircle className="h-6 w-6 text-success-500" />,
      bgColor: 'bg-success-50',
      textColor: 'text-success-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Overview of case management system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`card ${stat.bgColor} border border-neutral-100 overflow-hidden`}
          >
            <div className="flex items-center">
              <div className="mr-4">{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                <p className={`text-2xl font-semibold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Cases */}
      <div className="card border border-neutral-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-neutral-900">Recent Cases</h2>
          <button 
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            onClick={() => navigate('/cases')}
          >
            View all cases
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Case #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Reported
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {recentCases.map((caseItem) => (
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
                    <span className="badge badge-blue">
                      {caseItem.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(caseItem.priority)}
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
      </div>
    </div>
  );
};

export default DashboardOverview;