import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <Shield className="mx-auto h-12 w-12 text-primary-500" />
        <h2 className="mt-6 text-3xl font-bold text-neutral-900">404 - Page Not Found</h2>
        <p className="mt-2 text-base text-neutral-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary mx-auto"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;