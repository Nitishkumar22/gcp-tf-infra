import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useFilter } from '../../contexts/FilterContext';

const FilterPanel = ({ 
  contentType, 
  onFilterChange, 
  initialFilters = {},
  className = ''
}) => {
  const { fetchFilterOptionsForType, isLoading } = useFilter();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Fetch filter options for this content type
  useEffect(() => {
    const getOptions = async () => {
      const data = await fetchFilterOptionsForType(contentType);
      if (data) {
        setOptions(data);
      }
    };
    
    if (contentType) {
      getOptions();
    }
  }, [contentType, fetchFilterOptionsForType]);
  
  // Update active filters count
  useEffect(() => {
    const count = Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
    setActiveFiltersCount(count);
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Apply filters
  const applyFilters = () => {
    setAppliedFilters(filters);
    onFilterChange(filters);
    setIsOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setAppliedFilters({});
    onFilterChange({});
  };
  
  // Render different filter types based on content type
  const renderFilterOptions = () => {
    if (!options) return null;
    
    switch (contentType) {
      case 'collabs':
        return (
          <>
            {/* Project Type Filter */}
            {options.projectTypes && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Project Type</h3>
                <Select
                  value={filters.projectType || ''}
                  onValueChange={(value) => handleFilterChange('projectType', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Project Types</SelectItem>
                    {options.projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Genre Filter */}
            {options.genres && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Genre</h3>
                <Select
                  value={filters.genre || ''}
                  onValueChange={(value) => handleFilterChange('genre', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genres</SelectItem>
                    {options.genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Payment Status Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Payment</h3>
              <RadioGroup
                value={filters.paymentStatus || 'all'}
                onValueChange={(value) => handleFilterChange('paymentStatus', value)}
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
            
            {/* Time Period Filter */}
            {options.timePeriods && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Time Period</h3>
                <Select
                  value={filters.timePeriod || ''}
                  onValueChange={(value) => handleFilterChange('timePeriod', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Time Period</SelectItem>
                    {options.timePeriods.map((period) => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Required Role Filter */}
            {options.requiredRoles && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Required Role</h3>
                <Select
                  value={filters.requiredRole || ''}
                  onValueChange={(value) => handleFilterChange('requiredRole', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Role</SelectItem>
                    {options.requiredRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Deadline Range Filter */}
            {options.deadlineRange && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Deadline</h3>
                <Select
                  value={filters.deadlineDays || ''}
                  onValueChange={(value) => handleFilterChange('deadlineDays', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select deadline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Deadline</SelectItem>
                    {options.deadlineRange.map((range) => (
                      <SelectItem key={range.label} value={range.days?.toString() || 'null'}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Sort By Filter */}
            {options.sortBy && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Sort By</h3>
                <Select
                  value={filters.sortBy || 'newest'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
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
          </>
        );
        
      case 'ads':
        return (
          <>
            {/* Category Filter */}
            {options.categories && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Category</h3>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => {
                    handleFilterChange('category', value);
                    // Reset subcategory when category changes
                    handleFilterChange('subcategory', '');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {options.categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Subcategory Filter - Only show if category is selected */}
            {options.subcategories && filters.category && options.subcategories[filters.category] && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Subcategory</h3>
                <Select
                  value={filters.subcategory || ''}
                  onValueChange={(value) => handleFilterChange('subcategory', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subcategories</SelectItem>
                    {options.subcategories[filters.category].map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Condition Filter */}
            {options.condition && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Condition</h3>
                <Select
                  value={filters.condition || ''}
                  onValueChange={(value) => handleFilterChange('condition', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Condition</SelectItem>
                    {options.condition.map((condition) => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Price Range Filter */}
            {options.priceRange && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Price Range</h3>
                <Select
                  value={filters.priceRange || ''}
                  onValueChange={(value) => {
                    if (value === '') {
                      handleFilterChange('minPrice', '');
                      handleFilterChange('maxPrice', '');
                      handleFilterChange('priceRange', '');
                    } else {
                      const [min, max] = value.split('-');
                      handleFilterChange('minPrice', min);
                      handleFilterChange('maxPrice', max === 'null' ? null : max);
                      handleFilterChange('priceRange', value);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Price</SelectItem>
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
            
            {/* Status Filter */}
            {options.status && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Status</SelectItem>
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
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Sort By</h3>
                <Select
                  value={filters.sortBy || 'newest'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
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
          </>
        );
        
      case 'rohs':
        return (
          <>
            {/* Category Filter */}
            {options.categories && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Category</h3>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {options.categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Department Filter */}
            {options.departments && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Department</h3>
                <Select
                  value={filters.department || ''}
                  onValueChange={(value) => handleFilterChange('department', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {options.departments.map((department) => (
                      <SelectItem key={department} value={department}>{department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Type Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Type</h3>
              <RadioGroup
                value={filters.type || ''}
                onValueChange={(value) => handleFilterChange('type', value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="all-types" />
                  <Label htmlFor="all-types">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="for-rent" id="for-rent" />
                  <Label htmlFor="for-rent">For Rent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="for-help" id="for-help" />
                  <Label htmlFor="for-help">For Help</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Status Filter */}
            {options.status && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Status</SelectItem>
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
            {options.priceRange && filters.type === 'for-rent' && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Price Range</h3>
                <Select
                  value={filters.priceRange || ''}
                  onValueChange={(value) => {
                    if (value === '') {
                      handleFilterChange('minPrice', '');
                      handleFilterChange('maxPrice', '');
                      handleFilterChange('priceRange', '');
                    } else {
                      const [min, max] = value.split('-');
                      handleFilterChange('minPrice', min);
                      handleFilterChange('maxPrice', max === 'null' ? null : max);
                      handleFilterChange('priceRange', value);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Price</SelectItem>
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
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Minimum Rating</h3>
              <Select
                value={filters.rating || ''}
                onValueChange={(value) => handleFilterChange('rating', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select minimum rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Rating</SelectItem>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} {rating === 1 ? 'Star' : 'Stars'} & Above
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort By Filter */}
            {options.sortBy && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Sort By</h3>
                <Select
                  value={filters.sortBy || 'newest'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
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
          </>
        );
        
      default:
        return <p>No filters available for this content type.</p>;
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
            {activeFiltersCount}
          </span>
        )}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 p-4 bg-white dark:bg-gray-950 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 w-72 sm:w-80 md:w-96"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                renderFilterOptions()
              )}
            </div>
            
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={activeFiltersCount === 0}
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterPanel;
