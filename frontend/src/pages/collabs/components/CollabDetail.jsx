import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { formatDate } from "../../../utils/formatters";
import { useAuth } from "../../../contexts/AuthContext";
import { Calendar, MapPin, User, Clock, Tag, MessageCircle, Mail, Info, Users, Film, Briefcase, ChevronLeft } from "lucide-react";

const CollabDetail = () => {
  const { id } = useParams();
  const { authUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: collab, isLoading, error } = useQuery({
    queryKey: ["collab", id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/collabs/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch collaboration details");
      return res.json();
    },
  });

  const { mutate: applyToCollab, isLoading: isApplying } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/collabs/${id}/apply`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to apply to collaboration");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["collab", id]);
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error.message}</div>;

  const hasApplied = collab.applicants?.some(
    (applicant) => applicant._id === authUser?._id
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-6 max-w-5xl"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <Button 
          onClick={() => window.history.back()} 
          variant="ghost" 
          className="flex items-center gap-1 mb-4 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      </motion.div>
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
          {collab.title}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">{collab.projectType}</Badge>
          {collab.status && (
            <Badge variant={collab.status === "Open" ? "success" : "secondary"}>
              {collab.status}
            </Badge>
          )}
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          {/* Images Gallery */}
          <Card className="overflow-hidden border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-0">
              {collab.images && collab.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-w-16 aspect-h-9 rounded-t-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={collab.images[0]}
                        src={collab.images[0]}
                        alt={collab.title}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </AnimatePresence>
                  </div>
                  {collab.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4">
                      {collab.images.slice(1).map((img, index) => (
                        <motion.div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img
                            src={img}
                            alt={`${collab.title} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-muted flex flex-col items-center justify-center rounded-xl p-8">
                  <Film className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mt-4 text-center">No project images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="overflow-hidden border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Project Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {collab.description}
              </p>
              
              {/* Genres */}
              {collab.genres && collab.genres.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {collab.genres.map((genre, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        #{genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
          <Card className="overflow-hidden border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Looking for:</span>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => applyToCollab()}
                    disabled={isApplying || hasApplied || collab.status !== "Open"}
                    variant={hasApplied ? "outline" : "default"}
                    className="rounded-full px-6 transition-all duration-300"
                  >
                    {hasApplied ? "Applied" : "Apply Now"}
                  </Button>
                </motion.div>
              </div>

              {/* Roles needed */}
              {collab.rolesNeeded && collab.rolesNeeded.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {collab.rolesNeeded.map((role, index) => (
                    <Badge key={index} variant="secondary" className="justify-center">
                      {role}
                    </Badge>
                  ))}
                </div>
              )}

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Location:</span> {collab.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Posted by:</span>{" "}
                        {collab.user?.username || "Anonymous"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Start Date:</span>{" "}
                        {collab.startDate ? formatDate(collab.startDate) : "Flexible"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Duration:</span>{" "}
                        {collab.duration || "Not specified"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Compensation:</span>{" "}
                        {collab.isPaid ? "Paid" : "Unpaid"}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4 mt-2">
                  <h2 className="text-xl font-semibold">Contact Options</h2>
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full rounded-lg flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Creator
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full rounded-lg flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Chat with Creator
                      </Button>
                    </motion.div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CollabDetail;
