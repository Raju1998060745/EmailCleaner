import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const RedirectPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error) {
      setStatus('error');
      // Redirect back to dashboard after 3 seconds
      setTimeout(() => navigate('/'), 3000);
    } else {
      setStatus('success');
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="card p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing Authentication</h2>
            <p className="text-gray-400">Please wait while we process your request...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center fade-in">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Successful</h2>
            <p className="text-gray-400">You've successfully connected your Gmail account.</p>
            <p className="text-gray-400 mt-4">Redirecting to dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex flex-col items-center fade-in">
            <XCircle size={64} className="text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-gray-400">There was an error connecting your Gmail account.</p>
            <p className="text-gray-400 mt-4">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedirectPage;