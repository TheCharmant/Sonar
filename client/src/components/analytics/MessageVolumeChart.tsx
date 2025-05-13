import React from 'react';
import { EmailAnalytics } from '../../services/analyticsService';

interface MessageVolumeChartProps {
  data: EmailAnalytics['messageVolumeOverTime'];
}

const MessageVolumeChart: React.FC<MessageVolumeChartProps> = ({ data }) => {
  // Find the maximum value to scale the chart
  const maxValue = Math.max(
    ...data.received,
    ...data.sent
  );
  
  // Calculate the height of each bar (percentage of max)
  const getBarHeight = (value: number) => {
    return value / maxValue * 100;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Message Volume Over Time</h3>
      
      {/* Legend */}
      <div className="flex items-center justify-center mb-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">Messages Sent</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
          <span className="text-sm text-gray-600">Messages Received</span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative h-64">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-gray-200 w-full"></div>
          ))}
        </div>
        
        {/* Chart bars */}
        <div className="absolute inset-0 flex justify-around items-end">
          {data.weeks.map((week, index) => (
            <div key={week} className="flex flex-col items-center w-1/4">
              {/* Sent messages bar */}
              <div 
                className="w-8 bg-blue-500 rounded-t"
                style={{ height: `${getBarHeight(data.sent[index])}%` }}
              ></div>
              
              {/* Week label */}
              <div className="text-xs text-gray-500 mt-2">{week}</div>
            </div>
          ))}
        </div>
        
        {/* Received messages line */}
        <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={data.weeks.map((_, index) => {
              const x = (index / (data.weeks.length - 1)) * 100;
              const y = 100 - getBarHeight(data.received[index]);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#ECC94B"
            strokeWidth="2"
          />
          {data.received.map((value, index) => {
            const x = (index / (data.weeks.length - 1)) * 100;
            const y = 100 - getBarHeight(value);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#ECC94B"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default MessageVolumeChart;
