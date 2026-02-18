import React from 'react';

/**
 * TableSkeleton Component
 * 
 * Reusable skeleton loader for tables.
 * 
 * @param {number} rows - Number of rows to render (default: 5)
 * @param {number} columns - Number of columns for generic mode (default: 5)
 * @param {function} children - Render prop for custom row layout (optional)
 * 
 * Usage Generic:
 * <TableSkeleton columns={5} rows={5} />
 * 
 * Usage Custom (for sticky columns etc):
 * <TableSkeleton rows={5}>
 *   {(index) => (
 *     <>
 */
export default function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse border-b border-gray-50">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
