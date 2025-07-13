import React from 'react'
import AccessibilityPage from './AccesibilityPage'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full mx-auto px-2 sm:px-16 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="rounded-full h-14 w-14 flex items-center justify-center"
        >
          <ChevronLeft className="w-10 h-10" />
          <h1 className="text-2xl font-bold">Settings</h1>

        </Button>
      </div>
      <AccessibilityPage />
    </div>
  )
}

export default Settings