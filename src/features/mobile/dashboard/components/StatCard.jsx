import React from 'react';

export default function StatCard({
  title,
  value,
  icon,
  gradient,
  iconGradient,
  iconColor,
  delay = '0'
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-[20px] p-4 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl transition-all duration-300 animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`bg-gradient-to-br ${iconGradient} ${iconColor} p-3 rounded-2xl shadow-inner border border-white/60`}>
          {icon}
        </div>
        <div>
          <p className="text-text-gray text-xs font-medium mb-1">{title}</p>
          <h4 className="text-3xl font-bold text-text-dark tracking-tight">{value}</h4>
        </div>
      </div>
    </div>
  );
}
