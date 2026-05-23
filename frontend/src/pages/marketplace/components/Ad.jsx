import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { formatPrice } from "../../../utils/formatters";

const Ad = ({ ad }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/ads/${ad._id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
      onClick={handleClick}
    >
      <Card className="h-full flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        {/* SOLD indicator without image */}
        {ad.isSold && (
          <div className="bg-black/10 p-2 text-center">
            <span className="text-gray-700 font-bold text-lg">SOLD</span>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-2">{ad.productName}</CardTitle>
            <span className="text-lg font-bold">{formatPrice(ad.price, ad.currency)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{ad.category}</Badge>
            <Badge variant="outline" className="bg-muted">
              {ad.condition}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {ad.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {ad.tags?.map((tag, index) => (
                <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <p>Location: {ad.location}</p>
            <p>{ad.views} views</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Ad;