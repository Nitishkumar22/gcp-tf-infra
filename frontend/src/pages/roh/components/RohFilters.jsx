"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useFilter } from "../../../contexts/FilterContext"
import { Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"

const RohFilters = ({ activeFilters, onFilterChange }) => {
  const { fetchFilterOptionsForType, isLoading } = useFilter();
  const [options, setOptions] = useState(null);

  // Fetch filter options from backend
  useEffect(() => {
    const getOptions = async () => {
      const data = await fetchFilterOptionsForType('rohs');
      if (data) {
        setOptions(data);
      }
    };
    
    getOptions();
  }, [fetchFilterOptionsForType]);
  
  if (isLoading || !options) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filter Items</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Helper to handle select changes and pass "all" as undefined
  const handleSelectChange = (filterName, value) => {
    onFilterChange(filterName, value === "all" ? "" : value);
  };

  // Helper for text input changes (e.g., location)
  const handleInputChange = (e) => {
    onFilterChange(e.target.name, e.target.value);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter by Type (Rent/Help) */}
          {options.typeOptions && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Type</Label>
              <Select 
                value={activeFilters.type || "all"} 
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {options.typeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filter by Category */}
          {options.categories && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category</Label>
              <Select 
                value={activeFilters.category || "all"} 
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {options.categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filter by Department */}
          {options.departments && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Department</Label>
              <Select 
                value={activeFilters.department || "all"} 
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {options.departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filter by Status */}
          {options.status && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Status</Label>
              <Select 
                value={activeFilters.status || "all"} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  {options.status.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Range Filter - Only show if type is for-rent */}
          {options.priceRange && activeFilters.type === 'for-rent' && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Price Range</Label>
              <Select
                value={activeFilters.priceRange || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    onFilterChange("minPrice", "");
                    onFilterChange("maxPrice", "");
                    onFilterChange("priceRange", "");
                  } else {
                    const [min, max] = value.split("-");
                    onFilterChange("minPrice", min);
                    onFilterChange("maxPrice", max === "null" ? null : max);
                    onFilterChange("priceRange", value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  {options.priceRange.map((range) => (
                    <SelectItem 
                      key={range.label} 
                      value={`${range.min}-${range.max || 'null'}`}
                    >
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Rating Filter */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Minimum Rating</Label>
            <Select
              value={activeFilters.rating || "all"}
              onValueChange={(value) => handleSelectChange("rating", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select minimum rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} {rating === 1 ? 'Star' : 'Stars'} & Above
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Location (Text Input) */}
          <div className="space-y-1.5">
            <Label htmlFor="location-filter" className="text-sm font-medium">Location</Label>
            <Input
              id="location-filter"
              name="location" // Make sure name matches the filter key
              placeholder="Search by city, area..."
              value={activeFilters.location || ""} // Controlled component
              onChange={handleInputChange}
            />
          </div>

          {/* Sort By Filter */}
          {options.sortBy && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Sort By</Label>
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
                       sort === 'price-low-high' ? 'Price: Low to High' : 
                       sort === 'price-high-low' ? 'Price: High to Low' : 
                       sort === 'highest-rated' ? 'Highest Rated' : sort}
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

export default RohFilters 