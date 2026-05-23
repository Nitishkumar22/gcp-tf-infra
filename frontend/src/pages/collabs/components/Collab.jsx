"use client"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"

const Collab = ({ collab }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/collabs/${collab._id}`);
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
      <Card className="h-full flex flex-col cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2">{collab.title}</CardTitle>
          <Badge variant="outline" className="w-fit">
            {collab.projectType}
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{collab.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {collab.genres &&
                collab.genres.map((genre, index) => (
                  <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                    #{genre}
                  </span>
                ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Location: {collab.location}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Collab

