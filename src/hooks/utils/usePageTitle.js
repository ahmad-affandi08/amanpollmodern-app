import { useEffect } from 'react';

/**
 * Hook to update the document title.
 * Format: "APP_NAME | Title"
 * @param {string} title - The title of the current page
 */
const usePageTitle = (title) => {
  useEffect(() => {
    const appName = import.meta.env.VITE_APP_NAME || 'AmanPoll';
    if (title) {
      document.title = `${appName} | ${title}`;
    } else {
      document.title = appName;
    }
  }, [title]);
};

export default usePageTitle;
