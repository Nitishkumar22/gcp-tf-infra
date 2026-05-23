import { FaRegComment, FaRegHeart, FaRegBookmark } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ProfileModal from "../../../components/ProfileModal";
import { CommentSection } from "../../../components/CommentSection";
import { formatPostDate } from "../../../utils/date/index";

const Post = ({ post }) => {
  const [comments, setComments] = useState(post.comments);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const postOwner = post.user;
  const [isLiked, setIsLiked] = useState(authUser ? post.likes.includes(authUser._id) : false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const isMyPost = authUser ? authUser._id === post.user._id : false;
  const formattedDate = formatPostDate(post.createdAt); // For demonstration, format the date as required
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

  // If authUser is not loaded yet, don't render the post
  if (!authUser) {
    return <LoadingSpinner />;
  }

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/posts/like/${post._id}`, {
          method: "POST",
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
        throw error;
      }
    }, 
    onSuccess: (updatedLikes) => {
      setLocalLikes(updatedLikes);
      setIsLiked(updatedLikes.includes(authUser._id));
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData?.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/posts/${post._id}`, {
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
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    }
  });

// This is just the part that needs updating in the Post.jsx file
// Only showing the commentPost mutation part

const { mutate: commentPost, isPending: isCommenting } = useMutation({
  mutationFn: async (commentText) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/posts/comment/${post._id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add comment");
      }

      // The updated controller now returns just the new comment
      const newComment = await res.json();
      return newComment;
    } catch (error) {
      throw error;
    }
  },
  onSuccess: (newComment) => {
    setComments(prev => [...prev, newComment]);
    // Update the post's comments count in the cache
    queryClient.setQueryData(["posts"], (oldData) => {
      if (!oldData?.pages) return oldData;
      
      return oldData.pages.map(page => ({
        ...page,
        posts: page.posts.map(p => {
          if (p._id === post._id) {
            return {
              ...p,
              comments: [...p.comments, newComment]
            };
          }
          return p;
        })
      }));
    });
  },
  onError: (error) => {
    toast.error(error.message || "Failed to add comment");
  }
});

  const handleDeletePost = () => {
    deletePost();
  };


  const handleLikePost = () => {
    if (isLiking) return;
    setIsLiked(!isLiked); // Optimistically update isLiked state
    setLocalLikes((prevLikes) =>
      isLiked ? prevLikes.filter((id) => id !== authUser._id) : [...prevLikes, authUser._id]
    ); // Optimistically update localLikes state
    likePost();
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? post.imgs.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === post.imgs.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsProfileOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border overflow-hidden"
    >
      <div className="px-4 pt-4 pb-2 border-border">
        <div className="flex items-center space-x-3">
          <div onClick={() => handleUserClick(postOwner)} className="flex-shrink-0 h-12 cursor-pointer">
            <Avatar className=" h-12 w-12">
              <AvatarImage
                src={postOwner.profileImg}
                alt={postOwner.fullName || postOwner.username}
              />
              <AvatarFallback>
                {(postOwner.fullName || postOwner.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-grow min-w-0">
            <p onClick={() => handleUserClick(postOwner)} className="font-semibold text-sm text-foreground hover:underline">
              {postOwner.fullName || postOwner.username}
            </p>
            <div className=" flex-grow min-w-10 text-xs text-muted-foreground truncate">
              <div className=" flex">
                <p>@{postOwner.username}</p> 
                <span className=" px-2">  |  </span> 
                <p>{postOwner.bio}</p>
              </div>
              <span>{formattedDate}</span>
            </div>
          </div>
          {isMyPost && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-muted-foreground hover:text-destructive transition duration-200"
              onClick={handleDeletePost}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <FaTrash className="w-5 h-5" />
              )}
            </motion.button>
          )}
        </div>
      </div>
      <div className="px-5 pb-4">
        <p className="text-foreground text-sm mb-4">{post.text}</p>
        {post.imgs && post.imgs.length > 0 && (
          <div className="relative w-full h-80 mb-4">
            <img
              src={post.imgs[currentImageIndex]}
              className="w-full h-full object-contain rounded-lg"
              alt=""
            />
            {post.imgs.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 transform -translate-y-1/2"
                  onClick={goToPreviousImage}
                >
                  &#10094;
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2"
                  onClick={goToNextImage}
                >
                  &#10095;
                </Button>
              </>
            )}
          </div>
        )}
        <div className="flex justify-between text-xs items-center mb-4">
          <div
            className={`flex items-center space-x-1 cursor-pointer`}
            onClick={handleLikePost}
          >
            {isLiking ? (
              <LoadingSpinner size="sm" className=" border-pink-500" />
            ) : isLiked ? (
              <FaRegHeart className="w-4 h-4 text-pink-500" />
            ) : (
              <FaRegHeart className="w-4 h-4 text-slate-500 hover:text-pink-500" />
            )}
            <span
              className={`text-sm hover:text-pink-500 ${
                isLiked ? "text-pink-500" : "text-slate-500"
              }`}
            >
              {localLikes.length}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.0 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-1 text-muted-foreground"
            onClick={() => setIsCommentSectionOpen(!isCommentSectionOpen)}
          >
            <FaRegComment className="w-4 h-4" />
            <span>({post.comments.length})</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.0 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-1 text-muted-foreground"
          >
            <FaRegBookmark className="w-4 h-4" />
            <span>Save</span>
          </motion.button>
        </div>
        <CommentSection
          postId={post._id}
          authUser={authUser}
          comments={comments}
          isOpen={isCommentSectionOpen}
          commentPost={commentPost}
          isCommenting={isCommenting}
        />
      </div>
      <ProfileModal
        key={selectedUser?.id} // Ensuring the modal has a unique key if rendered
        user={selectedUser}
        isOpen={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />
    </motion.div>
  );
};

export default Post;
