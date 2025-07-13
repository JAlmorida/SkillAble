import Navbar from '@/components/navBarUI/NavBar'
import React from 'react'
import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="bg-background">
      <Navbar />
      <div className="pt-16">
        <Outlet/>
      </div>
    </div>
  )
}

export default MainLayout