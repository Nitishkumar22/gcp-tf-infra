import React, { useState } from "react";
import CreatePost from "./components/CreatePost";
import Posts from "./components/Posts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const CommunityPosts = () => {
  const [feedType, setFeedType] = useState("all");

  return (
    <div className=" bg-white pt-12 max-w-2xl mx-auto p-4">
      <CreatePost />
      <CardHeader className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Feed</h2>
          <Select value={feedType} onValueChange={setFeedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="following">Following</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
            </SelectContent> 
          </Select>
        </div>
      </CardHeader>
      <Posts feedType={feedType} />
    </div>
  );
};

export default CommunityPosts;
