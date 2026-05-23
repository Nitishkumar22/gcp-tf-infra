import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ authUser }) => {
  return authUser ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
