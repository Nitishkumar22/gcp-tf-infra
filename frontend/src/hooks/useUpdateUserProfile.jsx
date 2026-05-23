import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/update`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					},
					body: JSON.stringify(formData),
				});

				if (!res.ok) {
					const errorData = await res.text();
					try {
						const jsonError = JSON.parse(errorData);
						throw new Error(jsonError.error || "Failed to update profile");
					} catch {
						throw new Error(errorData || "Failed to update profile");
					}
				}

				const contentType = res.headers.get("content-type");
				if (!contentType || !contentType.includes("application/json")) {
					throw new Error("Invalid response format");
				}

				return res.json();
			} catch (error) {
				console.error("Error updating profile:", error);
				throw error;
			}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["UserProfile"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update profile");
		},
	});

	return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;