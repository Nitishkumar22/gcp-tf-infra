import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import formatCommentDate from "../utils/dateUtils";

export const CommentSection = ({
  postId,
  authUser,
  comments,
  isOpen,
  commentPost,
  isCommenting,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentPost(newComment); // Pass the newComment to the commentPost function
    setNewComment("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="border-t border-border p-4">
            <ScrollArea className="h-[200px] w-full pr-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="mb-4 pb-4 border-b last:border-b-0"
                >
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-12 h-12">
                      {comment.user ? (
                        <>
                          <AvatarImage
                            src={comment.user.profileImg}
                            alt={comment.user.fullName}
                          />
                        </>
                      ) : (
                        <AvatarFallback>?</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-semibold text-xxs">
                        {comment.user?.fullName || "Unknown User"}
                      </p>
                      <p className="text-xs font text-accent-foreground">
                        {comment.text}
                      </p>
                      <p className="text-xxs font-light text-muted-foreground">
                        {formatCommentDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <form onSubmit={handleSubmitComment} className="mt-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" disabled={isCommenting}>
                  {isCommenting ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};