"use client"

import { motion, AnimatePresence } from "framer-motion"
import Collab from "./Collab"
import { Skeleton } from "../../../components/ui/skeleton"
import useCollabs from "../../../hooks/useCollabs"
import LoadingSpinner from "../../../components/LoadingSpinner"

const CollabSkeleton = () => (
  <div className="h-full">
    <Skeleton className="w-full h-[250px] rounded-lg" />
  </div>
)

// Mock data
const mockCollabs = [
  {
    _id: "1",
    title: "Looking for cinematographer for short film",
    description:
      "I'm directing a short film about urban life and need an experienced cinematographer who can capture the essence of city living.",
    projectType: "Film",
    genres: ["Drama", "Urban"],
    location: "New York",
  },
  {
    _id: "2",
    title: "Music composer needed for indie game",
    description:
      "Developing a pixel art adventure game and looking for someone to create an atmospheric soundtrack.",
    projectType: "Music",
    genres: ["Game", "Indie"],
    location: "Remote",
  },
  {
    _id: "3",
    title: "Seeking writer for screenplay adaptation",
    description: "I have the rights to a novel and need a screenwriter to adapt it for a feature film.",
    projectType: "Writing",
    genres: ["Adaptation", "Feature"],
    location: "Los Angeles",
  },
  {
    _id: "4",
    title: "Documentary editor wanted",
    description:
      "I've shot footage for a documentary about local artisans and need an editor to help shape the narrative.",
    projectType: "Editing",
    genres: ["Documentary", "Local"],
    location: "Chicago",
  },
  {
    _id: "5",
    title: "Storyboard artist for animated short",
    description:
      "Creating an animated short and need someone to help with storyboarding and visual development.",
    projectType: "Animation",
    genres: ["Short", "2D"],
    location: "Remote",
  },
  {
    _id: "6",
    title: "Sound designer for horror film",
    description:
      "Working on a low-budget horror film and need a creative sound designer to create an immersive atmosphere.",
    projectType: "Sound",
    genres: ["Horror", "Indie"],
    location: "Toronto",
  },
]

const Collabs = ({ filters }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useCollabs(filters);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 md:hidden">Collaboration Posts</h1>

      <AnimatePresence>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <CollabSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500">
            {error.message}
          </motion.p>
        ) : data?.pages[0]?.collabs.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            No collaborations found.
          </motion.p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4"
              style={{
                gridAutoRows: "minmax(250px, auto)",
              }}
            >
              {data?.pages.map((page) =>
                page.collabs.map((collab) => (
                  <Collab key={collab._id} collab={collab} />
                ))
              )}
            </motion.div>

            {hasNextPage && !isFetchingNextPage && (
            <div className="p-4 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                className="px-3 py-1 bg-primary text-slate-200 rounded-md hover:bg-primary-dark"
              >
                Load More  
              </button>
            </div>
          )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Collabs

