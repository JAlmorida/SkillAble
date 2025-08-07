import React from 'react'
import AccessibilityPage from './AccesibilityPage'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full mx-auto px-2 sm:px-16">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">Settings</h1>

      <AccessibilityPage />
    </div>
  )
}

export default Settings