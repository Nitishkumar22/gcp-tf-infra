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
import { Calendar, DollarSign, MapPin, User, Clock, Shield, MessageCircle, Mail, Info, ChevronLeft } from "lucide-react";

const AdDetail = () => {
  const { id } = useParams();
  const { authUser } = useAuth();

  const { data: ad, isLoading, error } = useQuery({
    queryKey: ["ad", id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/ads/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch ad details");
      return res.json();
    },
  });

  const { mutate: toggleInterest, isLoading: isTogglingInterest } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/ads/${id}/toggle-interest`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to update interest");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ad", id]);
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error.message}</div>;

  const isInterested = ad.interests.some(
    (interest) => interest._id === authUser?._id
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent inline-block">
          {ad.productName}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">{ad.category}</Badge>
          <Badge variant="outline" className="bg-muted">
            {ad.condition}
          </Badge>
          {ad.isSold && (
            <Badge variant="destructive">SOLD</Badge>
          )}
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          {/* Image Gallery with smooth transitions */}
          <Card className="overflow-hidden border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-0">
              {ad.imgs && ad.imgs.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-w-16 aspect-h-9 rounded-t-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={ad.imgs[0].url}
                        src={ad.imgs[0].url}
                        alt={ad.productName}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </AnimatePresence>
                  </div>
                  {ad.imgs.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4">
                      {ad.imgs.slice(1).map((img, index) => (
                        <motion.div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img
                            src={img.url}
                            alt={`${ad.productName} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-muted flex items-center justify-center rounded-xl">
                  <Info className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mt-4">No images available</p>
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
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
                    {formatPrice(ad.price, ad.currency)}
                  </p>
                  {ad.isNegotiable && (
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
                    onClick={() => toggleInterest()}
                    disabled={isTogglingInterest}
                    variant={isInterested ? "outline" : "default"}
                    className="rounded-full px-6 transition-all duration-300"
                  >
                    {isInterested ? "Remove Interest" : "Show Interest"}
                  </Button>
                </motion.div>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-2">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Description</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {ad.description}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="specs" className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Location:</span> {ad.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Posted by:</span>{" "}
                        {ad.user.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        <span className="font-medium">Purchase Date:</span>{" "}
                        {formatDate(ad.bought_on)}
                      </p>
                    </div>
                    {ad.warranty?.hasWarranty && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Warranty until:</span>{" "}
                          {formatDate(ad.warranty.expiryDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4 mt-2">
                  <h2 className="text-xl font-semibold">Contact Options</h2>
                  <div className="space-y-3">
                    {ad.contactPreferences.email && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" className="w-full rounded-lg flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email Seller
                        </Button>
                      </motion.div>
                    )}
                    {ad.contactPreferences.chat && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" className="w-full rounded-lg flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" /> Chat with Seller
                        </Button>
                      </motion.div>
                    )}
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

export default AdDetail; 