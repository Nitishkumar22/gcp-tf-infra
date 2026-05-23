import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { 
    mutate: follow,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/follow/${userId}`, {
          method: "POST",
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          const errorData = await res.text();
          try {
            const jsonError = JSON.parse(errorData);
            throw new Error(jsonError.error || "Failed to update follow status");
          } catch {
            throw new Error(errorData || "Failed to update follow status");
          }
        }

        return res.json();
      } catch (error) {
        console.error("Error following user:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Follow status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["UserProfile"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update follow status");
    },
  });

  return { follow, isPending, isSuccess, isError };
};

export default useFollow;
