const PostSkeleton = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded-full w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded-full w-1/3"></div>
          </div>
        </div>
        <div className="h-48 bg-gray-300 rounded-lg"></div>
      </div>
    );
  };
  
  export default PostSkeleton;
  