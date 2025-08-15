// src/context/JobsContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMyJobs } from '../utils/fetchJobs';


type JobsContextType = {
  jobs: any;
  loading: boolean;
  refreshJobs: () => Promise<void>;
};

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider = ({ children }: { children: React.ReactNode }) => {
  const [jobs, setJobs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshJobs = async () => {
    try {
      setLoading(true);
      // You can combine 3 APIs here if needed
      const updatedJobs = await getMyJobs();
      setJobs(updatedJobs);
    } catch (err) {
      console.error('Failed to refresh jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshJobs();
  }, []);

  return (
    <JobsContext.Provider value={{ jobs, loading, refreshJobs }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
