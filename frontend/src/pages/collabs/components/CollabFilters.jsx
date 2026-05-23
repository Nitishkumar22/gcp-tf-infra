"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"
import { Label } from "../../../components/ui/label"
import { useFilter } from "../../../contexts/FilterContext"
import { Loader2 } from "lucide-react"

const CollabFilters = ({ activeFilters, onFilterChange }) => {
  const { fetchFilterOptionsForType, isLoading } = useFilter();
  const [options, setOptions] = useState(null);

  // Fetch filter options from backend
  useEffect(() => {
    const getOptions = async () => {
      const data = await fetchFilterOptionsForType('collabs');
      if (data) {
        setOptions(data);
      }
    };
    
    getOptions();
  }, [fetchFilterOptionsForType]);

  // Helper to handle select changes
  const handleSelectChange = (filterType, value) => {
    // Convert "all" to empty string or undefined based on your API requirements
    const processedValue = value === "all" ? "" : value;
    onFilterChange(filterType, processedValue);
  };

  if (isLoading || !options) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filter Collabs</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Collabs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project Type Filter */}
          {options.projectTypes && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type</label>
              <Select 
                value={activeFilters.projectType || "all"} 
                onValueChange={(value) => handleSelectChange("projectType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {options.projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Genre Filter */}
          {options.genres && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Genre</label>
              <Select 
                value={activeFilters.genre || "all"} 
                onValueChange={(value) => handleSelectChange("genre", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {options.genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment</label>
            <RadioGroup
              value={activeFilters.paymentStatus || 'all'}
              onValueChange={(value) => onFilterChange("paymentStatus", value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-payment" />
                <Label htmlFor="all-payment">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">Paid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unpaid" id="unpaid" />
                <Label htmlFor="unpaid">Unpaid</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Location Filter */}
          {options.locations && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select 
                value={activeFilters.location || "all"} 
                onValueChange={(value) => handleSelectChange("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {options.locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Required Role Filter */}
          {options.requiredRoles && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Role</label>
              <Select 
                value={activeFilters.requiredRole || "all"} 
                onValueChange={(value) => handleSelectChange("requiredRole", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Role</SelectItem>
                  {options.requiredRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sort By Filter */}
          {options.sortBy && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select 
                value={activeFilters.sortBy || "newest"} 
                onValueChange={(value) => onFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {options.sortBy.map((sort) => (
                    <SelectItem key={sort} value={sort}>
                      {sort === 'newest' ? 'Newest First' : 
                       sort === 'deadline-soon' ? 'Deadline Soon' : 
                       sort === 'most-popular' ? 'Most Popular' : sort}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CollabFilters

