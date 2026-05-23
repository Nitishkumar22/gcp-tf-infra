import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Navbar from "./components/Navbar/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";

// Public Pages
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";

// Protected Pages
import ProfilePage from "./pages/profile/ProfilePage";
import CommunityPosts from "./pages/posts/CommunityPosts";
import Chat from "./pages/chat/index";
import DiscoverMates from "./pages/posts/DiscoverMates";
import Contact from "./pages/contact/Contact";
import ExploreAds from "./pages/marketplace/ExploreAds";
import ExploreCollabs from "./pages/collabs/ExploreCollabs";
import NotificationPage from "./pages/notifications/NotificationPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import ExploreRoh from "./pages/roh/ExploreRoh";

// Detail Components
import AdDetail from "./pages/marketplace/components/AdDetail";
import CollabDetail from "./pages/collabs/components/CollabDetail";
import RohDetail from "./pages/roh/components/RohDetail";

// Layout components
const PublicLayout = ({ children }) => (
  <div className="bg-white font-poppins min-h-screen">{children}</div>
);

const AuthenticatedLayout = ({ children }) => (
  <div className="bg-white font-poppins min-h-screen">
    <Navbar />
    <ChatProvider>
      <main className="">{children}</main>
    </ChatProvider>
  </div>
);

const OnboardingLayout = ({ children }) => (
  <div className="bg-white font-poppins min-h-screen">
    {/* You could add a minimal header/progress indicator here */}
    {children}
  </div>
);

// Primary route guard with unified logic
const ProtectedRoute = ({ element, requiresOnboarding = true, allowWithOnboarding = true }) => {
  const { authUser, isLoading } = useAuth();
  const username = authUser ? authUser.username : null;

  const location = useLocation();

  // Show loading spinner during authentication check
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!authUser) {
    // Store the current path for redirection after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Handle onboarding requirements
  const hasCompletedOnboarding = !!authUser.onboardingCompleted;

  if (requiresOnboarding && !hasCompletedOnboarding) {
    // Needs to complete onboarding first
    return <Navigate to="/onboarding" replace />;
  }

  if (!allowWithOnboarding && hasCompletedOnboarding) {
    // Already completed onboarding, don't show onboarding again
    return <Navigate to={`/profile/${username}`} replace />;
  }

  // Apply the appropriate layout based on route type
  if (!hasCompletedOnboarding && location.pathname === "/onboarding") {
    return <OnboardingLayout>{element}</OnboardingLayout>;
  }

  return <AuthenticatedLayout>{element}</AuthenticatedLayout>;
};

// Public routes with redirect for authenticated users
const PublicRoute = ({ element }) => {
  const { authUser, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Check for intended destination after login
  const from = location.state?.from || "/posts";
  
  // If authenticated, redirect to appropriate page
  if (authUser) {
    return <Navigate to={authUser.onboardingCompleted ? from : "/onboarding"} replace />;
  }
  
  return <PublicLayout>{element}</PublicLayout>;
};

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute element={<HomePage />} />} />
        <Route path="/signup" element={<PublicRoute element={<SignUpPage />} />} />
        <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />

        {/* Onboarding route - requires auth but not completed onboarding */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute 
              element={<OnboardingPage />} 
              requiresOnboarding={false} 
              allowWithOnboarding={false} 
            />
          } 
        />

        {/* Protected routes requiring completed onboarding */}
        <Route path="/posts" element={<ProtectedRoute element={<CommunityPosts />} />} />
        <Route path="/profile/:username" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
        <Route path="/mates" element={<ProtectedRoute element={<DiscoverMates />} />} />
        <Route path="/collabs" element={<ProtectedRoute element={<ExploreCollabs />} />} />
        <Route path="/ads/explore" element={<ProtectedRoute element={<ExploreAds />} />} />
        <Route path="/ads/:id" element={<ProtectedRoute element={<AdDetail />} />} />
        <Route path="/contact" element={<ProtectedRoute element={<Contact />} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<NotificationPage />} />} />
        <Route path="/roh" element={<ProtectedRoute element={<ExploreRoh />} />} />
        <Route path="/roh/:id" element={<ProtectedRoute element={<RohDetail />} />} />
        <Route path="/collabs/:id" element={<ProtectedRoute element={<CollabDetail />} />} />

        {/* Catch-all route - 404 page would be better than redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;