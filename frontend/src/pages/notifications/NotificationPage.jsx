import React from 'react';
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";  
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser, FaHeart } from "react-icons/fa";
import { FaComment } from "react-icons/fa6";
import { User, ChevronRight, X } from "lucide-react";
import { formatPostDate } from '../../utils/date/index';
import useNotifications from "../../hooks/useNotifications";

const NotificationPage = () => {
	const queryClient = useQueryClient();
	
	const { data: notifications, isLoading } = useNotifications();

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/notifications`, {
					method: "DELETE",
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
						throw new Error(jsonError.error || "Failed to delete notifications");
					} catch {
						throw new Error(errorData || "Failed to delete notifications");
					}
				}

				return res.json();
			} catch (error) {
				console.error("Error deleting notifications:", error);
				throw error;
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete notifications");
		},
	});

	const { mutate: deleteNotification } = useMutation({
		mutationFn: async (notificationId) => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/notifications/${notificationId}`, {
					method: "DELETE",
					credentials: "include",
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					}
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) { 
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Notification deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className='flex flex-col max-w-7xl px-4 pt-16 mx-auto'>
			<div className='flex justify-between items-center my-8'>
				<p className='font-medium text-4xl'>Notifications</p>

				<DropdownMenu>
					<DropdownMenuTrigger>
						<IoSettingsOutline className='h-6 w-6' />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Settings</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={deleteNotifications}>Delete all notifications</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{isLoading && (
				<div className='flex justify-center h-full items-center'>
					<LoadingSpinner size='lg' />
				</div>
			)}

			<div className="bg-gray-50 my-8 rounded-3xl h-screen">
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				<div className="m-8">
					{notifications?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((notification) => (
						<div className='flex border-b-2 justify-between items-center border-white' key={notification._id}>
							<div className='flex gap-2 items-center p-4'>
								{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
								{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
								{notification.type === "unfollow" && <FaUser className='w-7 h-7 text-gray-500' />}
								{notification.type === "comment" && <FaComment className='w-7 h-7 text-blue-500' />}
								<Link className="ml-4" to={`/profile/${notification.from.username}`}>
									<Avatar className="h-12 w-12">
										<AvatarImage
											src={notification.from.profileImg}
											alt={notification.from.fullName}
										/>
										<AvatarFallback>
											<User className="text-gray-700" />
										</AvatarFallback>
									</Avatar>
								</Link>
								<div className='flex gap-1 ml-5'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{notification.type === "follow" && "followed you"}
									{notification.type === "like" && "liked your post"}
									{notification.type === "unfollow" && "unfollowed you"}
									{notification.type === "comment" && "commented on your post"}
								</div>
							</div>
							<div className="flex gap-10 items-center">
								<Link className="flex items-center hover:underline" to={`/profile/${notification.from.username}`}>
									<span className='font-semibold'>View Profile</span>
									<ChevronRight className="h-5" />
								</Link>
								<span className='flex text-xs text-gray-600'>{formatPostDate(notification.createdAt)}</span>
								<button
									onClick={() => deleteNotification(notification._id)}
									className="text-gray-500 hover:text-red-500 transition-colors duration-200"
									aria-label="Delete notification"
								>
									<X className="h-5 w-5" />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default NotificationPage;