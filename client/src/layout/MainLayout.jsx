import Navbar from '@/components/navBarUI/NavBar'
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import FloatingHomeButton from "../components/controls/FloatingHomeButton.jsx";

function MainLayout() {
  const location = useLocation();
  const noNavbarRoutes = ["/login", "/register"];
  const hideNavbar =
    noNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <div className="bg-background">
      {!hideNavbar && <Navbar />}
      <div className={!hideNavbar ? "pt-20" : ""}>
        <FloatingHomeButton />
        <Outlet/>
      </div>
    </div>
  )
}

export default MainLayout