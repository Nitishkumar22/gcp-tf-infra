import { createContext, useContext } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  
  // Authentication status query with improved error handling
  const { 
    data: authUser, 
    isLoading, 
    error,
    refetch: refreshUser
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/me`, {
          credentials: "include",
          headers: {
            "Accept": "application/json",
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null; // Not authenticated
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch user data");
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Auth fetch error:", error);
        // Return null to indicate not authenticated rather than throwing
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      // Only retry network errors, not auth failures
      return failureCount < 3 && error.message !== "Failed to fetch";
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  // Logout mutation
  const { mutate: logout, isLoading: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Logout failed");
      }
      
      return true;
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(["authUser"], null);
      // Clear other user-related queries
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Force refresh auth state even on error
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  });

  // Update onboarding status function
  const updateOnboardingStatus = async (completed = true) => {
    try {
      // Call your API to update the onboarding status
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/onboarding`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ onboardingCompleted: completed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      // Update the user data in the cache
      queryClient.setQueryData(["authUser"], (old) => ({
        ...old,
        onboardingCompleted: completed,
      }));

      return true;
    } catch (error) {
      console.error("Update onboarding error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      authUser, 
      isLoading: isLoading || isLoggingOut, 
      logout, 
      refreshUser,
      updateOnboardingStatus,
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;