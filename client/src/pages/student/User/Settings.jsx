import React from 'react'
import AccessibilityPage from './AccesibilityPage'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full mx-auto px-2 sm:px-16 py-8">
      <div className="flex flex-row items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent text-blue-600 font-semibold focus:outline-none active:bg-transparent"
          title="Back to Home"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-base sm:text-lg">Back</span>
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">Settings</h1>

      <AccessibilityPage />
    </div>
  )
}

export default Settings