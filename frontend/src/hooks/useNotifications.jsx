import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Shared fetcher function to keep logic consistent
const fetchNotifications = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/notifications`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.text();
      try {
        const jsonError = JSON.parse(errorData);
        throw new Error(jsonError.error || "Failed to fetch notifications");
      } catch {
        throw new Error(errorData || "Failed to fetch notifications");
      }
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Helper function to prefetch notifications
export const prefetchNotifications = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 15000
  });
};

const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
    staleTime: 15000,
    cacheTime: 1000 * 60 * 5,
    onError: (error) => {
      toast.error(error.message || "Failed to load notifications");
    }
  });
};

export default useNotifications;
