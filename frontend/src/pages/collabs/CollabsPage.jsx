import { useState } from 'react';
import { FilterProvider } from '../../contexts/FilterContext';
import FilteredContentGrid from '../../components/filters/FilteredContentGrid';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { CalendarIcon, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CollabCard = ({ collab }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">{collab.title}</CardTitle>
          <Badge variant={collab.isPaid ? "default" : "secondary"}>
            {collab.isPaid ? "Paid" : "Unpaid"}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>Deadline: {formatDistanceToNow(new Date(collab.deadline), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-sm text-gray-700 line-clamp-3">{collab.description}</p>
        
        {collab.genres && collab.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {collab.genres.map(genre => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        )}
        
        {collab.requiredCraftsmen && collab.requiredCraftsmen.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Looking for:</p>
            <div className="flex flex-wrap gap-1">
              {collab.requiredCraftsmen.map(role => (
                <Badge key={role} variant="outline" className="text-xs bg-gray-50">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={collab.user?.profileImg} alt={collab.user?.fullName} />
              <AvatarFallback>{collab.user?.fullName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{collab.user?.fullName || 'Anonymous'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            <span>{collab.joinRequests?.length || 0} requests</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const CollabsPage = () => {
  // Initial filters can be set here
  const initialFilters = {
    sortBy: 'newest'
  };
  
  return (
    <FilterProvider>
      <div className="container mx-auto px-4 py-8">
        <FilteredContentGrid
          contentType="collabs"
          renderItem={(collab) => <CollabCard collab={collab} />}
          emptyMessage="No collaborations found. Try adjusting your filters or check back later."
          initialFilters={initialFilters}
        />
      </div>
    </FilterProvider>
  );
};

export default CollabsPage;
