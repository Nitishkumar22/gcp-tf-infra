import { Card, CardContent, CardHeader } from "../../../components/ui/card";

const AdSkeleton = () => {
  return (
    <Card className="h-full">
      <div className="h-48 bg-muted animate-pulse" />
      <CardHeader className="pb-2">
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
          <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-4 w-16 bg-muted animate-pulse rounded-full" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdSkeleton; 