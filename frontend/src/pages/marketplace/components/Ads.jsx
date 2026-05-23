import { useInfiniteQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Ad from "./Ad";
import AdSkeleton from "./AdSkeleton";
import useAds from "../../../hooks/useAds"

import { Button } from "../../../components/ui/button";
import LoadingSpinner from "../../../components/LoadingSpinner";

const Ads = ({ filters }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useAds(filters);

  // Add debugging
  console.log('Ads component data:', data);
  console.log('Filters:', filters);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 lg:hidden">Marketplace</h1>

      <AnimatePresence>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <AdSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-red-500"
          >
            {error.message}
          </motion.p>
        ) : data?.pages[0]?.ads.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-8"
          >
            <p className="text-muted-foreground">No equipment listings found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or check back later.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4"
            >
              {data?.pages.map((page) =>
                page.ads.map((ad) => (
                  <Ad key={ad._id} ad={ad} />
                ))
              )}
            </motion.div>

            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="w-1/3"
                >
                  {isFetchingNextPage ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ads;