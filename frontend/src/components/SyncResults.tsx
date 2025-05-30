import React from 'react';
import { Clock, Mail, CheckCircle } from 'lucide-react';
import { SyncStats } from '../types';

interface SyncResultsProps {
  isLoading: boolean;
  stats: SyncStats | null;
}

const SyncResults: React.FC<SyncResultsProps> = ({ isLoading, stats }) => {
  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Syncing your inbox...</h2>
        <div className="flex justify-center my-8">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
        <p className="text-center text-gray-400">
          This may take a few moments depending on the size of your inbox
        </p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-6">Sync Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Mail className="text-blue-400 mr-2" size={20} />
            <h3 className="font-medium">Emails Processed</h3>
          </div>
          <p className="text-2xl font-bold">{stats.processed.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="text-green-400 mr-2" size={20} />
            <h3 className="font-medium">New Emails Inserted</h3>
          </div>
          <p className="text-2xl font-bold">{stats.inserted.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Clock className="text-purple-400 mr-2" size={20} />
            <h3 className="font-medium">Time Elapsed</h3>
          </div>
          <p className="text-2xl font-bold">{stats.timeElapsed.toFixed(2)}s</p>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Sync Summary</h3>
        <p className="text-gray-400">
          Successfully processed {stats.processed.toLocaleString()} emails from your inbox, 
          adding {stats.inserted.toLocaleString()} new entries to your database in {stats.timeElapsed.toFixed(2)} seconds.
        </p>
      </div>
    </div>
  );
};

export default SyncResults;