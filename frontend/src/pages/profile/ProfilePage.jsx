import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";

import Posts from "../posts/components/Posts";
import ProfileHeaderSkeleton from "../../assets/skeletons/ProfileHeaderSkeleton";

import { FaArrowLeft } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";
import EditProfileForm from "./EditProfileForm";

import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import { EllipsisVertical, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { useChat } from "../../contexts/ChatContext";

function getHostName(url) {
  try {
    const normalized = url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
    return new URL(normalized).hostname;
  } catch {
    return url;
  }
}

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const [activeSettingsTab, setActiveSettingsTab] = useState("editProfile");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);
  const navigate = useNavigate();

  const { username } = useParams();

  const { follow, isPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { navigateToChat } = useChat();

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["UserProfile", username],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/profile/${username}`, {
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
            throw new Error(jsonError.error || "Failed to fetch profile");
          } catch {
            throw new Error(errorData || "Failed to fetch profile");
          }
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format");
        }

        return res.json();
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to load profile");
    }
  });

  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

  const isMyProfile = authUser._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser.following.includes(user?._id);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!isUpdatingProfile && (profileImg || coverImg)) {
        refetch(); // Refresh user data after profile update
    }
}, [isUpdatingProfile, profileImg, coverImg, refetch]);


  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case "editProfile":
        return <EditProfileForm authUser={authUser} />;
      case "changePassword":
        return <div>Change Password Form</div>;
      case "notificationSettings":
        return <div>Notification Settings</div>;
      case "profileVisibility":
        return <div>Profile Visibility Settings</div>;
      case "accountDeletion":
        return <div>Account Deletion</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex-1 min-h-screen bg-background pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading || isRefetching ? (
            <ProfileHeaderSkeleton />
          ) : !user ? (
            <p className="text-center text-lg mt-4">User not found</p>
          ) : (
            <>
              <div className="relative mb-8 group">
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={coverImg || user?.coverImg || "/cover.png"}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                  alt="cover image"
                />
                {isMyProfile && (
                  <div
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full cursor-pointer 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                              hover:bg-black/70"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="text-white text-lg" />
                  </div>
                )}
                <div className="absolute -bottom-16 left-6 mb-4">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 rounded-full border-4 border-background object-cover shadow-lg">
                      <AvatarImage
                        src={
                          profileImg ||
                          user?.profileImg ||
                          "/avatar-placeholder.png"
                        }
                        alt={authUser.fullName}
                      />
                      <AvatarFallback>
                        {authUser.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isMyProfile && (
                      <div
                        className="absolute top-0 right-0 p-1 mt-2 mr-2 bg-primary rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => profileImgRef.current.click()}
                      >
                        <MdEdit className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  hidden
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
              </div>
              <div className="flex justify-between items-center mt-12">
                <div className=" flex items-center gap-2 mt-2">
                  <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                  <Separator orientation="vertical" className="h-6 border-1 border-gray-950" />
                  <p className="text-muted-foreground">@{user?.username}</p>
                </div>
                <div className=" flex gap-2">
                  {isMyProfile ? (
                      <div className="p-1 border border-1 rounded-lg">
                      < EllipsisVertical className=" h-6 w-6 text-black " />
                      </div>
                  ) : (
                    <>
                      <button
                        className="bg-primary text-primary-foreground rounded-full px-6 py-2 hover:bg-primary/90 transition"
                        onClick={() => follow(user?._id)}
                        disabled={isPending}
                      >
                        {isPending
                          ? "Loading..."
                          : amIFollowing
                          ? "Unfollow"
                          : "Follow"}
                      </button>
                      
                      {/* Message button - only show if the user follows this person */}
                      {amIFollowing && (
                        <button
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 rounded-full px-6 py-2 hover:bg-gray-200 transition"
                          onClick={() => navigateToChat(user?._id, navigate)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </button>
                      )}
                    </>
                  )}
                  {(coverImg || profileImg) && (
                    <button
                      className=" bg-black hover:bg-gray-900 rounded-md btn-sm text-white py-2 px-4 ml-2"
                      onClick={async () => {
                        await updateProfile({ coverImg, profileImg });
                        setProfileImg(null);
                        setCoverImg(null);
                      }}
                    >
                      {isUpdatingProfile ? "Updating..." : "Update"}
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-8">
                <p className="text-foreground mb-4">{user?.bio}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {user?.link && (
                    <a
                      href={
                        user.link.startsWith("http://") || user.link.startsWith("https://")
                          ? user.link
                          : `https://${user.link}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      <FaLink className="w-4 h-4 mr-2" />
                      {getHostName(user.link)}
                    </a>
                  )}
                  <div className="flex items-center">
                    <IoCalendarOutline className="w-4 h-4 mr-2" />
                    {memberSinceDate}
                  </div>
                </div>
                <div className="flex gap-8 mt-4">
                  <div className="flex items-center">
                    <span className="font-bold mr-1">
                      {user?.following.length}
                    </span>
                    <span className="text-muted-foreground">Following</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold mr-1">
                      {user?.followers.length}
                    </span>
                    <span className="text-muted-foreground">Followers</span>
                  </div>
                </div>
              </div>
              <Tabs defaultValue="account" className="w-full mt-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="account">Account settings</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="collabs">Collabs</TabsTrigger>
                <TabsTrigger value="ads">Ads</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex">
                      <div className="w-1/4 pr-4">
                        <nav className="space-y-2">
                          <Button
                            variant={activeSettingsTab === "editProfile" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveSettingsTab("editProfile")}
                          >
                            Edit Profile
                          </Button>
                          <Button
                            variant={activeSettingsTab === "changePassword" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveSettingsTab("changePassword")}
                          >
                            Change Password
                          </Button>
                          <Button
                            variant={activeSettingsTab === "notificationSettings" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveSettingsTab("notificationSettings")}
                          >
                            Notification Settings
                          </Button>
                          <Button
                            variant={activeSettingsTab === "profileVisibility" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveSettingsTab("profileVisibility")}
                          >
                            Profile Visibility
                          </Button>
                          <Button
                            variant={activeSettingsTab === "accountDeletion" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveSettingsTab("accountDeletion")}
                          >
                            Account Deletion
                          </Button>
                        </nav>
                      </div>
                      <div className="w-3/4 pl-4">
                        {renderSettingsContent()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="posts">User's posts</TabsContent>
              <TabsContent value="collabs">Order history content</TabsContent>
              <TabsContent value="ads">Notification settings</TabsContent>
            </Tabs>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
