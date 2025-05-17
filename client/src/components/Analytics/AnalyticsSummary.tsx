import React from 'react';
import type { EmailAnalytics } from '../../services/analyticsService';

interface AnalyticsSummaryProps {
  analytics: EmailAnalytics;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Total Inbox Messages */}
      <div className="bg-purple-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-700">Total Inbox Messages</h3>
        <div className="flex items-end mt-2">
          <span className="text-3xl font-bold text-purple-600">{analytics.totalMessagesReceived}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          All messages in your inbox
        </div>
      </div>

      {/* Total Sent Messages */}
      <div className="bg-purple-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-700">Total Sent Messages</h3>
        <div className="flex items-end mt-2">
          <span className="text-3xl font-bold text-purple-600">{analytics.messagesSent}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          All messages in your sent folder
        </div>
      </div>

      {/* Pending Messages */}
      <div className="bg-purple-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-700">Pending Messages</h3>
        <div className="flex items-end mt-2">
          <span className="text-3xl font-bold text-purple-600">{analytics.pendingMessages}</span>
          <span className="ml-2 text-sm text-gray-500">scheduled or awaiting reply</span>
        </div>
      </div>

      {/* Response Time Average */}
      <div className="bg-purple-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-700">Response Time Average</h3>
        <div className="flex items-end mt-2">
          <span className="text-3xl font-bold text-purple-600">{analytics.responseTimeAverage}</span>
          <span className="ml-2 text-sm text-gray-500">hrs</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">average reply time</div>
      </div>
    </div>
  );
};

export default AnalyticsSummary;