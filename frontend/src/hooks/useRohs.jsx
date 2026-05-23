import { useInfiniteQuery } from "@tanstack/react-query";
// Use react-hot-toast directly
import toast from "react-hot-toast";

const useRohs = (filters = {}) => {
  // Remove useToast hook
  // const { toast } = useToast(); 

  // Clean filters: remove undefined or empty string values before sending
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});

  return useInfiniteQuery({
    // Query key includes the cleaned filters to ensure caching works correctly
    queryKey: ["roh", cleanFilters],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const queryParams = new URLSearchParams({
          page: pageParam,
          limit: 10, // Or adjust as needed
          ...cleanFilters, // Spread the cleaned filters here
        }).toString();

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/roh?${queryParams}`, {
          credentials: 'include', // Send cookies if needed for authentication
          headers: {
            'Accept': 'application/json',
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          // Throw error with message from backend if available
          throw new Error(data.message || "Failed to fetch RoH items");
        }

        // Normalize the response structure based on rohController.js output
        return {
          data: data.data || [], // The array of RoH items
          nextPage: data.currentPage + 1,
          hasMore: data.hasMore || false,
        };

      } catch (error) {
        console.error("Error fetching RoH items:", error);
        // Re-throw the error to be caught by react-query's onError
        throw error;
      }
    },
    // Determines the next page number to fetch
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1, // Start fetching from page 1
    staleTime: 1000 * 60 * 2, // Data is considered fresh for 2 minutes
    cacheTime: 1000 * 60 * 15, // Keep data in cache for 15 minutes
    retry: 1, // Retry failed requests once
    onError: (error) => {
        // Use react-hot-toast directly for errors
        toast.error(error.message || "Could not load items at this time.");
    },
  });
};

export default useRohs; 