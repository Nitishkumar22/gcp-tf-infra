"use client"

import { motion, AnimatePresence } from "framer-motion"
import Roh from "./Roh" // Use the Roh component created earlier
import { Skeleton } from "../../../components/ui/skeleton"
import useRohs from "../../../hooks/useRohs"; // Assume this hook exists and fetches RoH data
import LoadingSpinner from "../../../components/LoadingSpinner"
import { Button } from "../../../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { Terminal } from "lucide-react";

const RohSkeleton = () => (
  <div className="h-full">
    {/* Adjust skeleton height if needed based on Roh card size */}
    <Skeleton className="w-full h-[300px] rounded-lg" /> 
  </div>
)

const Rohs = ({ filters }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useRohs(filters); // Pass filters to the custom hook

  // Extract items from potentially paginated data structure
  const rohItems = data?.pages.flatMap(page => page.data) || [];

  return (
    <div>
      {/* Title is now in ExploreRoh.jsx */}
      {/* <h1 className="text-2xl font-bold mb-6 md:hidden">Rent or Help Items</h1> */}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
            // Adjust grid row height if Roh component size differs significantly
             style={{ gridAutoRows: "minmax(300px, auto)" }}
          >
            {[1, 2, 3, 4].map((i) => (
              <RohSkeleton key={i} />
            ))}
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
             <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Fetching Items</AlertTitle>
                <AlertDescription>{error?.message || "An unknown error occurred."}</AlertDescription>
            </Alert>
          </motion.div>
        ) : rohItems.length === 0 ? (
          <motion.p 
            key="no-results"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="text-center text-muted-foreground py-12"
          >
            No items found matching your criteria.
          </motion.p>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6" 
                style={{ gridAutoRows: "minmax(300px, auto)" }} // Ensure consistent row height
             >
                {rohItems.map((roh) => (
                   <Roh key={roh._id} roh={roh} />
                ))}
             </div>

            {/* Load More Button or Infinite Scroll Trigger */}
            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  size="sm"
                >
                  {isFetchingNextPage ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Rohs
