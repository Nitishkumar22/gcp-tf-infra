import { useState } from "react";
import { motion } from "framer-motion";
import PostAd from "./components/PostAd";
import Ads from "./components/Ads";
import AdFilters from "./components/AdFilters";
import MyAds from "./components/MyAds";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const ExploreAds = () => {
  const { authUser, isLoading } = useAuth();
  const [activeFilters, setActiveFilters] = useState({
    category: "all",
    minPrice: "",
    maxPrice: "",
    location: "all",
    condition: "all"
  });

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleAdPosted = () => {
    // Refresh ads list or show notification
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto pt-16 px-4 sm:px-6"
    >
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <PostAd onSubmit={handleAdPosted} />
        </div>
        
        <AdFilters 
          activeFilters={activeFilters} 
          onFilterChange={handleFilterChange} 
        />
        
        <Ads filters={activeFilters} />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:gap-6 lg:justify-between">
        {/* Left Column */}
        <div className="w-1/5 space-y-6 sticky top-20 h-fit">
          <PostAd onSubmit={handleAdPosted} />
          <AdFilters 
            activeFilters={activeFilters} 
            onFilterChange={handleFilterChange} 
          />
        </div>
        
        {/* Middle Column */}
        <div className="w-3/5 px-4">
          <Ads filters={activeFilters} />  
        </div>
        
        {/* Right Column */}
        <div className="w-1/4 top-20 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Listings</h2>
            <Link 
              to={`/marketplace/user/${authUser?.username}`} 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View All
            </Link>
          </div>
          <MyAds />
        </div>
      </div>
    </motion.div>
  );
};

export default ExploreAds;
