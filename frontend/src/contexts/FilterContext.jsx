import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filterOptions, setFilterOptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch all filter options
  const fetchFilterOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/filters/options`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }
      
      const data = await response.json();
      setFilterOptions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      setError('Failed to load filter options. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch filter options for a specific content type
  const fetchFilterOptionsForType = useCallback(async (type) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/filters/options/${type}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filter options for ${type}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching filter options for ${type}:`, err);
      setError(`Failed to load ${type} filter options. Please try again later.`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Apply filters to collabs
  const filterCollabs = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/filters/collabs?${queryParams.toString()}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to filter collabs');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error filtering collabs:', err);
      setError('Failed to apply filters. Please try again later.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Apply filters to ads
  const filterAds = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/filters/ads?${queryParams.toString()}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to filter ads');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error filtering ads:', err);
      setError('Failed to apply filters. Please try again later.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Apply filters to ROHs
  const filterRohs = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/filters/rohs?${queryParams.toString()}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to filter ROHs');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error filtering ROHs:', err);
      setError('Failed to apply filters. Please try again later.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);
  
  return (
    <FilterContext.Provider value={{
      filterOptions,
      isLoading,
      error,
      fetchFilterOptions,
      fetchFilterOptionsForType,
      filterCollabs,
      filterAds,
      filterRohs
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

export default FilterContext;
