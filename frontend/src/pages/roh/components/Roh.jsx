"use client"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { DollarSign, HelpCircle } from 'lucide-react' // Icons for price/help

// Helper function to format currency (optional, adjust as needed)
const formatPrice = (price) => {
  if (price == null) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const Roh = ({ roh }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/roh/${roh._id}`);
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
        {/* Image display removed */}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2 font-semibold">{roh.productName}</CardTitle>
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-1">
            <span>{roh.category}</span>
            {roh.isForHelp ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> Help Request
              </Badge>
            ) : roh.rentPrice != null ? (
              <Badge variant="outline" className="flex items-center gap-1">
                 <DollarSign className="h-3 w-3" /> {formatPrice(roh.rentPrice)}
                 {roh.isNegotiable && <span className="text-xs italic ml-1">(Negotiable)</span>}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between pt-0">
          <div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{roh.description}</p>

            {/* Display department as a badge */}
            <div className="flex flex-wrap gap-2 mb-3">
               <Badge variant="outline">{roh.department}</Badge>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-auto">
            <p>Location: {roh.location}</p>
             {/* TODO: Add user info (populated from backend) */}
             {/* <p>Posted by: {roh.user?.username}</p> */}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Roh
