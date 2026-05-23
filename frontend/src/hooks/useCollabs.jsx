import { useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useCollabs = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ["collabs", filters],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const queryParams = new URLSearchParams({
          page: pageParam,
          limit: 10,
          ...filters
        }).toString();

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/collabs?${queryParams}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.text();
          try {
            const jsonError = JSON.parse(errorData);
            throw new Error(jsonError.error || "Failed to fetch collaborations");
          } catch {
            throw new Error(errorData || "Failed to fetch collaborations");
          }
        }

        const data = await response.json();

        // Normalize the response structure
        return {
          collabs: Array.isArray(data) ? data : (data.collabs || []),
          nextPage: pageParam + 1,
          hasMore: Array.isArray(data) ? data.length === 10 : (data.hasMore || false)
        };

      } catch (error) {
        console.error("Error fetching collaborations:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
    onError: (error) => {
      toast.error(error.message || "Failed to load collaborations");
    }
  });
};

export default useCollabs;