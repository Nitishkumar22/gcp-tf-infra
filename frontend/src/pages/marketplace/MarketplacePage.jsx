import { useState } from 'react';
import { FilterProvider } from '../../contexts/FilterContext';
import FilteredContentGrid from '../../components/filters/FilteredContentGrid';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Eye, MapPin, Tag } from 'lucide-react';

const AdCard = ({ ad }) => {
  // Get primary image or first image
  const primaryImage = ad.imgs?.find(img => img.isPrimary)?.url || 
                      (ad.imgs?.[0]?.url || ad.imgs?.[0] || '');
  
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={primaryImage || 'https://placehold.co/400x300?text=No+Image'} 
          alt={ad.productName} 
          className="w-full h-full object-cover"
        />
        <Badge 
          className="absolute top-2 right-2" 
          variant={ad.status === 'available' ? 'default' : 'secondary'}
        >
          {ad.status?.charAt(0).toUpperCase() + ad.status?.slice(1)}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">{ad.productName}</h3>
          <div className="text-lg font-bold text-primary">
            {ad.currency} {ad.price}
            {ad.isNegotiable && <span className="text-xs text-gray-500 ml-1">(Negotiable)</span>}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Tag className="h-4 w-4 mr-1" />
          <span>{ad.category}</span>
          {ad.subcategory && ad.subcategory.length > 0 && (
            <span className="ml-1">• {ad.subcategory[0]}</span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{ad.location}</span>
        </div>
        
        <p className="text-sm text-gray-700 line-clamp-2 mt-2">{ad.description}</p>
        
        <div className="mt-3 flex items-center">
          <Badge variant="outline">{ad.condition}</Badge>
          {ad.views > 0 && (
            <div className="ml-auto flex items-center text-xs text-gray-500">
              <Eye className="h-3 w-3 mr-1" />
              <span>{ad.views} views</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={ad.user?.profileImg} alt={ad.user?.fullName} />
              <AvatarFallback>{ad.user?.fullName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{ad.user?.fullName || 'Anonymous'}</span>
          </div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const MarketplacePage = () => {
  // Initial filters can be set here
  const initialFilters = {
    sortBy: 'newest',
    status: 'available'
  };
  
  return (
    <FilterProvider>
      <div className="container mx-auto px-4 py-8">
        <FilteredContentGrid
          contentType="ads"
          renderItem={(ad) => <AdCard ad={ad} />}
          emptyMessage="No items found in the marketplace. Try adjusting your filters or check back later."
          initialFilters={initialFilters}
        />
      </div>
    </FilterProvider>
  );
};

export default MarketplacePage;
