import { useQuery } from "@tanstack/react-query";
import { Card } from "../../../components/ui/card";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Link } from "react-router-dom"; // Import Link
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Terminal } from "lucide-react";

const MyRohs = () => {
  const { data: response, isLoading, error, isError } = useQuery({
    queryKey: ["userRohs"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/roh/user`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch your RoH items");
        }
        return data.data; // Assuming backend returns { success: true, data: [...] }
      } catch (err) {
        // Catch network errors or errors thrown explicitly
        throw new Error(err.message || "An unexpected error occurred");
      }
    },
    retry: 1, // Optional: Retry once on failure
  });

  if (isLoading) return <LoadingSpinner size="md" />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // Get only the latest 5 items
  const latestRohs = response?.slice(0, 5) || [];

  if (latestRohs.length === 0) {
     return <p className="text-sm text-muted-foreground text-center py-4">You haven't posted any items yet.</p>;
  }

  return (
    <div className="space-y-2"> 
      {latestRohs.map((roh) => (
        <RohCard key={roh._id} roh={roh} />
      ))}
    </div>
  );
};

// Subcomponent for individual RoH cards in the "My Items" list
// This is simplified compared to the main Roh.jsx card
const RohCard = ({ roh }) => {
  return (
    // Link the entire card to the roh detail page (adjust path as needed)
    <Link to={`/roh/${roh._id}`} className="block group">
        <Card className="overflow-hidden group-hover:shadow-md transition-shadow duration-200 ease-in-out">
        {/* Upper section - Product Name */}
        <div className="px-3 py-1 border-b bg-card">
            <h3 className="font-medium text-sm line-clamp-1 truncate group-hover:text-primary">
            {roh.productName}
            </h3>
        </div>
        
        {/* Lower section - Description and Category/Type */}
        <div className="px-3 py-1 flex items-center justify-between bg-card">
            <div className="relative flex-1 pr-2">
            <p className="text-xs font-light text-muted-foreground line-clamp-1 truncate">
                {roh.description}
            </p>
            </div>
            <span className="text-[11px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full whitespace-nowrap">
            {roh.isForHelp ? "Help" : "Rental"} - {roh.category}
            </span>
        </div>  
        </Card>
    </Link>
  );
};

export default MyRohs;
