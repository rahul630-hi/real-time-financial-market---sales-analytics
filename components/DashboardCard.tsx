
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  children?: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, change, changeType, children, className }) => {
  const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 ${className}`}>
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-white">{value}</p>
        {change && (
          <p className={`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`}>
            {changeType === 'increase' ? (
              <svg className="self-center flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L6.22 8.78a.75.75 0 11-1.06-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="self-center flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.03-3.17a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.47 11.28a.75.75 0 111.06-1.06l3.03 3.17V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
              </svg>
            )}
            {change}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};

export default DashboardCard;
