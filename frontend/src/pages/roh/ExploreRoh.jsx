"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import PostRoh from "./components/PostRoh" 
import Rohs from "./components/Rohs" 
import RohFilters from "./components/RohFilters" 
import MyRohs from "./components/MyRohs" 
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext";

const ExploreRoh = () => {
  // State to hold the raw filter values from the components
  const [activeFilters, setActiveFilters] = useState({
    category: undefined, 
    location: undefined,
    isForHelp: undefined, // Use undefined for 'all' initially
    status: undefined,
  });

  const { authUser } = useAuth();

  // Handler for filter changes from RohFilters component
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      // Update the specific filter. Keep undefined for "all" or empty strings.
      [filterType]: (value === "all" || value === "") ? undefined : value,
    }));
  };

  // Memoize the cleaned filters to pass to the Rohs component
  // This prevents Rohs from re-rendering unnecessarily if activeFilters object reference changes but values are effectively the same
  const cleanFilters = useMemo(() => {
    return Object.entries(activeFilters).reduce((acc, [key, value]) => {
        // Only include filters that have a defined, non-empty value
        if (value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
    }, {});
  }, [activeFilters]); // Recalculate only when activeFilters change

  const handleRohPosted = () => {
    // Placeholder: Invalidate queries (handled in PostRoh now) or show confirmation
    console.log("RoH item posted successfully - callback in ExploreRoh");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto pt-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Mobile Layout - Single Column */}
      <div className="lg:hidden space-y-6 mb-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">Rent or Help</h1>
          <PostRoh onSubmit={handleRohPosted} />
        </div>
        
        <RohFilters 
          // Pass the raw activeFilters state to keep selects/inputs showing the correct value ("all", empty string, or actual value)
          activeFilters={activeFilters} 
          onFilterChange={handleFilterChange} 
        />
        
        {/* Pass the cleaned filters (without undefined/empty values) for the API query */}
        <Rohs filters={cleanFilters} />
      </div>

      {/* Desktop Layout - 3 Column Grid */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
        
        {/* Left Column (Filters & Post Button) */}
        <aside className="col-span-3 space-y-6 sticky top-20 h-fit">
          <PostRoh onSubmit={handleRohPosted} />
          
          <RohFilters 
            activeFilters={activeFilters} 
            onFilterChange={handleFilterChange} 
          />
        </aside>
        
        {/* Middle Column (RoH Items List) */}
        <main className="col-span-6">
           <h1 className="text-2xl font-bold mb-6">Rent or Help Items</h1>
           {/* Pass the cleaned filters for the API query */}
          <Rohs filters={cleanFilters} />
        </main>
        
        {/* Right Column (My Items) */}
        <aside className="col-span-3 sticky top-20 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Items</h2>
            {/* Ensure link works correctly based on your routing setup */}
            {authUser && (
              <Link 
                to={`/profile/${authUser?.username}?tab=roh`} // Adjust path if necessary
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                View All
              </Link>
            )}
          </div>
          <MyRohs /> 
        </aside>
      </div>
    </motion.div>
  );
}

export default ExploreRoh;
