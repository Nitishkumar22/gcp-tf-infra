"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import PostACollab from "./components/PostCollab"
import Collabs from "./components/Collabs"
import CollabFilters from "./components/CollabFilters"
import { useQuery } from "@tanstack/react-query"
import MyCollabs from "./components/MyCollabs"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext";


const ExploreCollabs = () => {
  const [activeFilters, setActiveFilters] = useState({
    projectType: "all",
    genre: "all",
    location: "all"
  })

  const { authUser, isLoading } = useAuth();


  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleCollabPosted = () => {
    console.log("Collaboration posted successfully")
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto pt-16 px-4 sm:px-6"
    >
      {/* Mobile Layout - Single Column */}
      <div className="lg:hidden space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">Collaboration Posts</h1>
          <PostACollab onSubmit={handleCollabPosted} />
        </div>
        
        <CollabFilters 
          activeFilters={activeFilters} 
          onFilterChange={handleFilterChange} 
        />
        
        <Collabs filters={activeFilters} />
      </div>

      {/* Desktop Layout - 3 Column */}
      <div className="hidden lg:flex lg:gap-6 lg:justify-between">
        {/* Left Column */}
        <div className="w-1/5 space-y-6 sticky top-20 h-fit">
          <PostACollab onSubmit={handleCollabPosted} />
          
          <CollabFilters 
            activeFilters={activeFilters} 
            onFilterChange={handleFilterChange} 
          />
        </div>
        
        {/* Middle Column */}
        <div className="w-3/5 px-4">
          <Collabs filters={activeFilters} />
        </div>
        
        {/* Right Column */}
        <div className="w-1/4 top-20 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Collabs</h2>
            <Link 
              to={`/collabs/user/${authUser?.username}`} 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View All
            </Link>
          </div>
          <MyCollabs />
        </div>
      </div>
    </motion.div>
  )
}

export default ExploreCollabs