import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { formatPrice, formatDate } from "../../../utils/formatters";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  Calendar, DollarSign, MapPin, User, Clock, Tag, 
  MessageCircle, Mail, Info, HelpCircle, Wrench,
  Briefcase, Shield, AlertCircle, ChevronLeft
} from "lucide-react";

// Helper function to format currency if not imported from utils
const formatPriceLocal = (price) => {
  if (price == null) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const RohDetail = () => {
  const { id } = useParams();
  const { authUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: roh, isLoading, error } = useQuery({
    queryKey: ["roh", id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/roh/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch rent/help details");
      return res.json();
    },
  });

  const { mutate: showInterest, isLoading: isShowingInterest } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/roh/${id}/interest`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to show interest");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roh", id]);
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error.message}</div>;

  const hasInterest = roh.interestedUsers?.some(
    (user) => user._id === authUser?._id
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent inline-block">
          {roh.productName}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">{roh.category}</Badge>
          <Badge variant="outline" className="bg-muted">
            {roh.department}
          </Badge>
          {roh.isForHelp && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" /> Help Request
            </Badge>
          )}
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          {/* Image Gallery with smooth transitions */}
          <Card className="overflow-hidden border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-0">
              {roh.imgs && roh.imgs.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-w-16 aspect-h-9 rounded-t-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={roh.imgs[0]}
                        src={roh.imgs[0]}
                        alt={roh.productName}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </AnimatePresence>
                  </div>
                  {roh.imgs.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4">
                      {roh.imgs.slice(1).map((img, index) => (
                        <motion.div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img
                            src={img}
                            alt={`${roh.productName} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-muted flex flex-col items-center justify-center rounded-xl p-8">
                  {roh.isForHelp ? (
                    <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50" />
                  ) : (
                    <Wrench className="h-12 w-12 text-muted-foreground opacity-50" />
                  )}
                  <p className="text-muted-foreground mt-4 text-center">
                    {roh.isForHelp ? "Help request - no images" : "Equipment - no images"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="overflow-hidden border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {roh.description}
              </p>
              
              {/* Specifications if available */}
              {roh.specifications && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(roh.specifications).map(([key, value], index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
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
                <div>
                  {roh.isForHelp ? (
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-purple-500" />
                      <span className="font-medium text-lg">Help Request</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
                      {formatPriceLocal(roh.rentPrice)}
                      <span className="text-sm text-muted-foreground">/day</span>
                    </p>
                  )}
                  {roh.isNegotiable && !roh.isForHelp && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Price negotiable
                    </p>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => showInterest()}
                    disabled={isShowingInterest}
                    variant={hasInterest ? "outline" : "default"}
                    className="rounded-full px-6 transition-all duration-300"
                  >
                    {hasInterest ? "Interested" : "Show Interest"}
                  </Button>
                </motion.div>
              </div>

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
                        <span className="font-medium">Location:</span> {roh.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Posted by:</span>{" "}
                        {roh.user?.username || "Anonymous"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Department:</span>{" "}
                        {roh.department}
                      </p>
                    </div>
                    {roh.availability && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Availability:</span>{" "}
                          {roh.availability}
                        </p>
                      </div>
                    )}
                    {!roh.isForHelp && roh.condition && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Condition:</span>{" "}
                          {roh.condition}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4 mt-2">
                  <h2 className="text-xl font-semibold">Contact Options</h2>
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full rounded-lg flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Owner
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full rounded-lg flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Chat with Owner
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

export default RohDetail;
