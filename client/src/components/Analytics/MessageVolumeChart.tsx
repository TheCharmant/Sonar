import React from 'react';
import type { EmailAnalytics } from '../../services/analyticsService';

interface MessageVolumeChartProps {
  data: EmailAnalytics['messageVolumeOverTime'];
}

const MessageVolumeChart: React.FC<MessageVolumeChartProps> = ({ data }) => {
  // Find the maximum value to scale the chart
  const maxValue = Math.max(
    ...data.received,
    ...data.sent,
    10 // Ensure we have a non-zero value for scaling
  );
  
  // Calculate the height of each bar (percentage of max)
  const getPointY = (value: number) => {
    return 80 - (value / maxValue * 60);
  };

  return (
    <div className="relative h-64">
      {/* Legend */}
      <div className="flex justify-center space-x-6 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
          <span className="text-sm text-gray-600">Messages Sent</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm text-gray-600">Messages Received</span>
        </div>
      </div>
      
      {/* Chart container */}
      <div className="relative h-48 mt-4">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-gray-200 w-full"></div>
          ))}
        </div>
        
        {/* Chart */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* Sent messages line (blue) */}
          <polyline
            points={data.weeks.map((_, index) => {
              const x = (index / (data.weeks.length - 1)) * 100;
              const y = getPointY(data.sent[index]);
              return `${x}%,${y}%`;
            }).join(' ')}
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2"
          />
          
          {/* Received messages line (yellow) */}
          <polyline
            points={data.weeks.map((_, index) => {
              const x = (index / (data.weeks.length - 1)) * 100;
              const y = getPointY(data.received[index]);
              return `${x}%,${y}%`;
            }).join(' ')}
            fill="none"
            stroke="#EAB308"
            strokeWidth="2"
          />
          
          {/* Dots for sent messages */}
          {data.sent.map((value, index) => {
            const x = (index / (data.weeks.length - 1)) * 100;
            const y = getPointY(value);
            return (
              <circle
                key={`sent-${index}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#4F46E5"
              />
            );
          })}
          
          {/* Dots for received messages */}
          {data.received.map((value, index) => {
            const x = (index / (data.weeks.length - 1)) * 100;
            const y = getPointY(value);
            return (
              <circle
                key={`received-${index}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#EAB308"
              />
            );
          })}
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {data.weeks.map((week, index) => (
          <div key={index} className="text-xs text-gray-500">{week}</div>
        ))}
      </div>
    </div>
  );
};

export default MessageVolumeChart;
