import Post from "./Post";
import React from "react";
import PostSkeleton from "../../../assets/skeletons/PostSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from "../../../components/LoadingSpinner";
import { ErrorBoundary } from "react-error-boundary";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "all":
        return `${import.meta.env.VITE_BASE_URL}/api/posts/all`;
      case "forYou":
        return `${import.meta.env.VITE_BASE_URL}/api/posts/all`;
      case "following":
        return `${import.meta.env.VITE_BASE_URL}/api/posts/following`;
      case "relevance":
        return `${import.meta.env.VITE_BASE_URL}/api/posts/all`;
      case "posts":
        return `${import.meta.env.VITE_BASE_URL}/api/posts/user/${username}`;
      case "likes":
        return `${import.meta.env.VITE_BASE_URL}/api/posts/likes/${userId}`;
      default:
        return `${import.meta.env.VITE_BASE_URL}/api/posts/all`;
    }
  };

  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`${getPostEndpoint()}?page=${pageParam}&limit=10`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await res.json();
      
      // Normalize the response to always have the same structure
      return {
        posts: Array.isArray(data) ? data : (data.posts || []),
        nextPage: pageParam + 1,
        hasMore: Array.isArray(data) ? data.length === 10 : (data.hasMore || false)
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isError) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  console.log('Posts component render - isLoading:', isLoading, 'data:', data, 'feedType:', feedType);

  return (
    <ErrorBoundary
      fallback={<div>Something went wrong. Please try again later.</div>}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 bg-white rounded-lg overflow-hidden"
        >
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col space-y-4 p-4"
              >
                <PostSkeleton />
                <PostSkeleton />
              </motion.div>
            )}
            
            {!isLoading && data?.pages[0]?.posts.length === 0 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-500 p-8"
              >
                No posts available. Start the conversation!
              </motion.p>
            )}

            {!isLoading && data && (
              <div className="space-y-4">
                {data.pages.map((page, pageIndex) => (
                  <React.Fragment key={pageIndex}>
                    {page.posts.map((post) => (
                      <Post key={post._id} post={post} />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            )}

            {isFetchingNextPage && (
              <div className="p-4 flex justify-center">
                <LoadingSpinner />
              </div>
            )}
          </AnimatePresence>

          {hasNextPage && !isFetchingNextPage && (
            <div className="p-4 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Load More  
              </button>
            </div>
          )}
        </motion.div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Posts;