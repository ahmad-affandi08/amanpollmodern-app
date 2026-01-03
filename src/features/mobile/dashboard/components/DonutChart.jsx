import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DonutChart({ title, data, colors }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm font-bold text-brand-primary">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white via-white to-gray-50/30 rounded-[20px] p-4 shadow-lg shadow-gray-200/50 border border-gray-100/50">
      <p className="text-center text-xs font-semibold text-text-gray mb-2">{title}</p>
      <div className="relative h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={35}
              outerRadius={50}
              paddingAngle={4}
              dataKey="value"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="block text-xl font-bold text-text-dark">{total}</span>
          <span className="text-[8px] uppercase tracking-wider text-gray-400">Total</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center mt-2">
        {data.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
            <span className="text-[9px] text-gray-500 truncate max-w-[60px]">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
