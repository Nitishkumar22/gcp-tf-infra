import { useState, useEffect } from 'react';
import { useFilter } from '../../contexts/FilterContext';
import FilterPanel from './FilterPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const FilteredContentGrid = ({
  contentType,
  renderItem,
  emptyMessage = 'No items found',
  className = '',
  initialFilters = {}
}) => {
  const { filterCollabs, filterAds, filterRohs, isLoading: isFilterLoading } = useFilter();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  
  // Apply filters based on content type
  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true);
      try {
        let data = [];
        
        switch (contentType) {
          case 'collabs':
            data = await filterCollabs(filters);
            break;
          case 'ads':
            data = await filterAds(filters);
            break;
          case 'rohs':
            data = await filterRohs(filters);
            break;
          default:
            setError(`Unsupported content type: ${contentType}`);
            return;
        }
        
        setItems(data);
        setError(null);
      } catch (err) {
        console.error(`Error filtering ${contentType}:`, err);
        setError(`Failed to load ${contentType}. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };
    
    applyFilters();
  }, [contentType, filters, filterCollabs, filterAds, filterRohs]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  return (
    <div className={className}>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {contentType === 'collabs' ? 'Collaborations' : 
           contentType === 'ads' ? 'Marketplace' : 
           contentType === 'rohs' ? 'Rent or Help' : 'Content'}
        </h2>
        <FilterPanel 
          contentType={contentType}
          onFilterChange={handleFilterChange}
          initialFilters={initialFilters}
        />
      </div>
      
      {isLoading || isFilterLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[300px] text-red-500">
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex justify-center items-center min-h-[300px] text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {items.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderItem(item)}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FilteredContentGrid;
