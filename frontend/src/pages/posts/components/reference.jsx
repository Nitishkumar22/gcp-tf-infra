import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Heart, Share2, Send, Image, FileVideo, Paperclip } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function FeedPage() {
  const [filter, setFilter] = useState("all")

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="hidden md:block">
            <Card className="w-full bg-white shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                <div className="space-y-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder.svg" alt="Profile" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium">John Doe</h3>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Post Message Component */}
            <Card className="w-full bg-white shadow-sm">
              <CardContent className="p-6">
                <Textarea
                  placeholder="What's on your mind?"
                  className="w-full resize-none border-none focus:ring-0 mb-4"
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Image className="w-5 h-5 mr-2" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileVideo className="w-5 h-5 mr-2" />
                      Video
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-5 h-5 mr-2" />
                      Attachment
                    </Button>
                  </div>
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feed Component */}
            <Card className="w-full bg-white shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Feed</h2>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter posts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="following">Following</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <ScrollArea className="h-[600px]">
                <CardContent className="p-0">
                  {[1, 2, 3, 4, 5].map((post) => (
                    <div key={post} className="p-6 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={`User ${post}`} />
                          <AvatarFallback>U{post}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-sm font-medium">User {post}</h3>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <p className="text-sm mb-4">
                        This is a sample post content. It can be a longer text describing thoughts, ideas, or sharing
                        information.
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Heart className="w-4 h-4 mr-2" />
                            Like
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Comment
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
 
          {/* Right Sidebar */}
          <div className="hidden md:block">
            <Card className="w-full bg-white shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Trending</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((trend) => (
                    <div key={trend} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <p className="text-sm">Trending Topic {trend}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}