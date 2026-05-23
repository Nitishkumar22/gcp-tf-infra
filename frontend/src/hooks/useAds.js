import { useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useAds = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ["ads", filters],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const queryParams = new URLSearchParams({
          page: pageParam,
          limit: 10,
          ...filters
        }).toString();

        const response = await fetch( 
          `${import.meta.env.VITE_BASE_URL}/api/ads?${queryParams}`,
          {
            credentials: "include",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          }
        );

        // Add some debugging
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Failed to fetch ads");
        }

        return {
          ads: data.ads,
          nextPage: data.currentPage + 1,
          hasMore: data.currentPage < data.totalPages
        };
      } catch (error) {
        console.error("Error fetching ads:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
    onError: (error) => {
      toast.error(error.message || "Failed to load ads");
    }
  });
};

export default useAds; 