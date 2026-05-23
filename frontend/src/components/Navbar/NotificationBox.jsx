import React, { useState, useCallback, useRef, useEffect } from "react";
import { Bell, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { formatPostDate } from "../../utils/date/index";
import useNotifications from "../../hooks/useNotifications";

const NotificationBox = React.memo(({ authUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const queryClient = useQueryClient();

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const { data: notifications, isLoading } = useNotifications();
  const notificationCount = notifications?.length || 0;

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
      toast.success("Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="p-2 rounded-full text-black hover:bg-gray-100 transition-colors duration-200 relative"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell />
        {notificationCount > 0 && (
          <span className="absolute mt-1 -top-1 -right-1 bg-gray-800 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 p-4 w-80"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <Link
                onClick={toggleDropdown}
                to="/notifications"
                className="px-2 hover:underline cursor-pointer rounded-lg font-normal text-sm"
              >
                See all
              </Link>
            </div>
            {isLoading ? (
              <p>Loading notifications...</p>
            ) : notifications?.length === 0 ? (
              <p>No new notifications for {authUser.username}</p>
            ) : (
              <ul className="space-y-2">
                {notifications?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((notification) => (
                  <li key={notification._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={notification.from.profileImg}
                          alt={notification.from.username}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold">{notification.from.username}</span>{" "}
									        {notification.type === "follow" && "followed you"}
									        {notification.type === "like" && "liked your post"}
									        {notification.type === "unfollow" && "unfollowed you"}
									        {notification.type === "comment" && "commented on your post"}                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPostDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      aria-label="Delete notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default NotificationBox;