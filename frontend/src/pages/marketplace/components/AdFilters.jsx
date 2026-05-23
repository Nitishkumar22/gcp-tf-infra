import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { motion } from "framer-motion";
import { useFilter } from "../../../contexts/FilterContext";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";

const AdFilters = ({ activeFilters, onFilterChange }) => {
  const { fetchFilterOptionsForType, isLoading } = useFilter();
  const [options, setOptions] = useState(null);

  // Fetch filter options from backend
  useEffect(() => {
    const getOptions = async () => {
      const data = await fetchFilterOptionsForType('ads');
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filter Equipment</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          {options.categories && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={activeFilters.category || "all"} 
                onValueChange={(value) => {
                  handleSelectChange("category", value);
                  // Reset subcategory when category changes
                  if (activeFilters.subcategory) {
                    onFilterChange("subcategory", "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {options.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subcategory Filter - Only show if category is selected */}
          {options.subcategories && activeFilters.category && options.subcategories[activeFilters.category] && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcategory</label>
              <Select 
                value={activeFilters.subcategory || "all"} 
                onValueChange={(value) => handleSelectChange("subcategory", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {options.subcategories[activeFilters.category].map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Range Filter */}
          {options.priceRange ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
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
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={activeFilters.minPrice || ""}
                  onChange={(e) => onFilterChange("minPrice", e.target.value)}
                  className="w-1/2"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={activeFilters.maxPrice || ""}
                  onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                  className="w-1/2"
                />
              </div>
            </div>
          )}

          {/* Condition Filter */}
          {options.condition && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <Select 
                value={activeFilters.condition || "all"} 
                onValueChange={(value) => handleSelectChange("condition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Condition</SelectItem>
                  {options.condition.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Filter */}
          {options.status && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={activeFilters.status || "all"} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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
                       sort === 'price-low-high' ? 'Price: Low to High' : 
                       sort === 'price-high-low' ? 'Price: High to Low' : 
                       sort === 'most-viewed' ? 'Most Viewed' : sort}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdFilters; 