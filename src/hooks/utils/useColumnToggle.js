import { useState, useEffect } from 'react';

/**
 * Reusable hook for managing table column visibility
 * @param {Array} columnDefs - Array of column definitions [{ key, label, defaultVisible, alwaysVisible }]
 * @param {string} storageKey - localStorage key for persistence
 */
export default function useColumnToggle(columnDefs, storageKey = 'columnVisibility') {
  const [visibleColumns, setVisibleColumns] = useState(() => {

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved column visibility', e);
      }
    }


    const initial = {};
    columnDefs.forEach(col => {
      initial[col.key] = col.defaultVisible !== false;
    });
    return initial;
  });


  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [visibleColumns, storageKey]);


  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };


  const showAll = () => {
    const all = {};
    columnDefs.forEach(col => {
      all[col.key] = true;
    });
    setVisibleColumns(all);
  };


  const hideAll = () => {
    const hidden = {};
    columnDefs.forEach(col => {
      hidden[col.key] = col.alwaysVisible === true;
    });
    setVisibleColumns(hidden);
  };


  const isVisible = (columnKey) => {
    return visibleColumns[columnKey] !== false;
  };

  return {
    visibleColumns,
    toggleColumn,
    showAll,
    hideAll,
    isVisible
  };
}
