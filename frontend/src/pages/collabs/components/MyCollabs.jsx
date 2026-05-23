import { useQuery } from "@tanstack/react-query";
import { Card } from "../../../components/ui/card";
import LoadingSpinner from "../../../components/LoadingSpinner";

const MyCollabs = () => {
  const { data: collabs, isLoading, error } = useQuery({
    queryKey: ["userCollabs"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/collabs/user`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch collabs");
      return res.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  // Get only the latest 5 collabs
  const latestCollabs = collabs?.slice(0, 5) || [];

  return (
    <div className="space-y-2"> {/* Reduced space between cards */}
      {latestCollabs.map((collab) => (
        <CollabCard key={collab._id} collab={collab} />
      ))}
    </div>
  );
};

// Subcomponent for individual collab cards
const CollabCard = ({ collab }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Upper section - Title */}
      <div className="px-3 py-1 border-b">
        <h3 className="font-medium text-sm line-clamp-1">{collab.title}</h3>
      </div>
      
      {/* Lower section - Description and Project Type */}
      <div className="px-3 py-1 flex items-center justify-between">
        <div className="relative flex-1 pr-4">
          <p className="text-xs font-light text-muted-foreground line-clamp-1">
            {collab.description}
          </p>
        </div>
        <span className="text-xs px-2 py-1 bg-muted rounded-full whitespace-nowrap">
          {collab.projectType}
        </span>
      </div>  
    </Card>
  );
};

export default MyCollabs;