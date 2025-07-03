import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'emerald' | 'orange' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={`text-sm font-medium ${trendColor}`}>{change}</span>
            <span className="text-sm text-gray-500">from last month</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;