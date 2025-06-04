import NavBar from '@/components/NavBar'
import React from 'react'
import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-16">
        <Outlet/>
      </div>
    </div>
  )
}

export default MainLayout