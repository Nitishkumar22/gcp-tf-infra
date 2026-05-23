import { useQuery } from "@tanstack/react-query";
import { Card } from "../../../components/ui/card";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Badge } from "../../../components/ui/badge";
import { formatPrice } from "../../../utils/formatters";
import toast from "react-hot-toast";

const MyAds = () => {
  const { data: ads, isLoading, error } = useQuery({
    queryKey: ["userAds"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/ads/user`, {
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch ads");
        }

        return res.json();
      } catch (error) {
        console.error("Error fetching user ads:", error);
        throw error;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to load your ads");
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  // Get only the latest 5 ads
  const latestAds = ads?.slice(0, 5) || [];

  return (
    <div className="space-y-2">
      {latestAds.map((ad) => (
        <AdCard key={ad._id} ad={ad} />
      ))}
    </div>
  );
};

// Subcomponent for individual ad cards
const AdCard = ({ ad }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Upper section - Title */} 
      <div className="px-3 py-1 border-b">
        <h3 className="font-medium text-sm line-clamp-1">{ad.productName}</h3>
      </div>
      
      {/* Lower section - Price and Status */}
      <div className="px-3 py-1 flex items-center justify-between">
        <div className="relative flex-1 pr-4">
          <p className="text-xs font-light text-muted-foreground">
            {formatPrice(ad.price, ad.currency)}
          </p>
        </div>
        <Badge 
          variant={ad.isSold ? "secondary" : "default"}
          className="text-xs whitespace-nowrap"
        >
          {ad.isSold ? "Sold" : "Active"}
        </Badge>
      </div>
    </Card>
  );
};

export default MyAds;