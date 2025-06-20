import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({children}) => {
  const { user, isAuthenticated } = useSelector(store => store.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (user && !user.isOnboarded) {
    return <Navigate to="/onboarding" />;
  }
  return children;
}

export const AuthenticatedUser = ({children}) => {
  const {isAuthenticated} = useSelector(store=>store.auth);

  if(isAuthenticated){
    return <Navigate to="/"/>
  }
  return children;
}

export const AdminRoute = ({children}) => {
  const {user, isAuthenticated} = useSelector(store=>store.auth);

  if(!isAuthenticated){
    return <Navigate to="/login"/>
  }
  if(user.role !== "admin"){
    return <Navigate to="/"/>
  }
  return children;
}

export const OnboardingRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector(store => store.auth);

  // Only allow access if authenticated and NOT onboarded
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (user && user.isOnboarded) {
    return <Navigate to="/" />;
  }
  return children;
};