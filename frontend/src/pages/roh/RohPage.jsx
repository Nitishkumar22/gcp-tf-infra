import { useState } from 'react';
import { FilterProvider } from '../../contexts/FilterContext';
import FilteredContentGrid from '../../components/filters/FilteredContentGrid';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, MapPin, Star, HelpCircle, Clock } from 'lucide-react';

const RohCard = ({ roh }) => {
  // Get first image
  const image = roh.imgs?.[0] || '';
  
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image || 'https://placehold.co/400x300?text=No+Image'} 
          alt={roh.productName} 
          className="w-full h-full object-cover"
        />
        <Badge 
          className="absolute top-2 right-2" 
          variant={roh.isForHelp ? 'secondary' : 'default'}
        >
          {roh.isForHelp ? 'For Help' : 'For Rent'}
        </Badge>
        
        <Badge 
          className="absolute top-2 left-2" 
          variant={roh.status === 'available' ? 'success' : 'outline'}
        >
          {roh.status?.charAt(0).toUpperCase() + roh.status?.slice(1)}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">{roh.productName}</h3>
          {!roh.isForHelp && (
            <div className="text-lg font-bold text-primary">
              ${roh.rentPrice}/day
              {roh.isNegotiable && <span className="text-xs text-gray-500 ml-1">(Negotiable)</span>}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Badge variant="outline">{roh.category}</Badge>
          <Badge variant="outline" className="ml-2">{roh.department}</Badge>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{roh.location}</span>
        </div>
        
        {roh.availability && (roh.availability.from || roh.availability.to) && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Available: {roh.availability.from ? new Date(roh.availability.from).toLocaleDateString() : 'Anytime'} 
              {roh.availability.to ? ` - ${new Date(roh.availability.to).toLocaleDateString()}` : ''}
            </span>
          </div>
        )}
        
        <p className="text-sm text-gray-700 line-clamp-2 mt-2">{roh.description}</p>
        
        {roh.averageRating > 0 && (
          <div className="mt-3 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.round(roh.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
              <span className="ml-1 text-sm text-gray-600">({roh.reviewCount})</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={roh.user?.profileImg} alt={roh.user?.fullName} />
              <AvatarFallback>{roh.user?.fullName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{roh.user?.fullName || 'Anonymous'}</span>
          </div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(roh.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const RohPage = () => {
  // Initial filters can be set here
  const initialFilters = {
    sortBy: 'newest',
    status: 'available'
  };
  
  return (
    <FilterProvider>
      <div className="container mx-auto px-4 py-8">
        <FilteredContentGrid
          contentType="rohs"
          renderItem={(roh) => <RohCard roh={roh} />}
          emptyMessage="No rent or help items found. Try adjusting your filters or check back later."
          initialFilters={initialFilters}
        />
      </div>
    </FilterProvider>
  );
};

export default RohPage;
