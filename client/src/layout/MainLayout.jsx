import Navbar from '@/components/navBarUI/NavBar'
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'

function MainLayout() {
  const location = useLocation();
  // List of routes that should NOT have the padding (e.g., login, register)
  const noPaddingRoutes = ["/login", "/register", "/onboarding"];
  const needsPadding = !noPaddingRoutes.includes(location.pathname);

  return (
    <div className="bg-background">
      <Navbar />
      <div className={needsPadding ? "pt-20" : ""}>
        <Outlet/>
      </div>
    </div>
  )
}

export default MainLayout