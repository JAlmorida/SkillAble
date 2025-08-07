import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Darkmode from "./Darkmode";
import FontSizeControls from "./FontSizeControls";
import ZoomControls from "./ZoomControls";
import ColorBlindFilter from "./ColorBlindFilter";
import ScreenReaderControls from "./ScreenReaderControls";
import FeedbackControls from "./FeedbackControls";
import { useZoom } from "@/components/context/ZoomProvider";
import { useColorBlind } from "@/components/context/ColorBlindContext";
import { useScreenReaderContext } from "@/components/context/ScreenReaderContext";
import { useFeedback } from "@/components/context/FeedbackContext";
import { useTheme } from "@/components/context/ThemeProvider";
import { useResize } from "@/components/context/ResizeContext";

const AccessibilityDrawer = () => {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Get enabled states and selected values for each setting
  const zoomEnabled = useZoom().isZoomEnabled;
  const colorBlindEnabled = useColorBlind().isEnabled;
  const screenReaderEnabled = useScreenReaderContext().isEnabled;
  const feedbackEnabled = useFeedback().isEnabled;
  const { theme } = useTheme();
  const { currentScale, scaleOption } = useResize();

  const themeLabels = {
    light: "Light",
    dark: "Dark",
    system: "System",
  };

  const settings = [
    {
      title: "Dark Mode",
      control: <Darkmode />,
      value: themeLabels[theme] || "System",
      enabled: true,
    },
    {
      title: "Font Size",
      control: <FontSizeControls />,
      value: scaleOption[currentScale]?.name || "Default",
      enabled: true,
    },
    {
      title: "Zoom",
      control: <ZoomControls />,
      value: zoomEnabled ? "On" : "Off",
      enabled: zoomEnabled,
    },
    {
      title: "Colorblind Filter",
      control: <ColorBlindFilter />,
      value: colorBlindEnabled ? "On" : "Off",
      enabled: colorBlindEnabled,
    },
    {
      title: "Screen Reader",
      control: <ScreenReaderControls />,
      value: screenReaderEnabled ? "On" : "Off",
      enabled: screenReaderEnabled,
    },
    {
      title: "Haptic Feedback",
      control: <FeedbackControls />,
      value: feedbackEnabled ? "On" : "Off",
      enabled: feedbackEnabled,
    },
  ];

  // Keyboard navigation handlers for drawer activation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + Alt + A to open/close accessibility drawer
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'a') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
      
      // Escape to close drawer
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Keyboard navigation handlers for settings
  const handleKeyDown = (event, idx) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setExpandedIdx(expandedIdx === idx ? null : idx);
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextIdx = (idx + 1) % settings.length;
        setExpandedIdx(expandedIdx === nextIdx ? null : nextIdx);
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIdx = idx === 0 ? settings.length - 1 : idx - 1;
        setExpandedIdx(expandedIdx === prevIdx ? null : prevIdx);
        break;
      case 'Escape':
        event.preventDefault();
        setExpandedIdx(null);
        break;
    }
  };

  // Focus management
  const handleFocus = (idx) => {
    // Optional: Auto-expand when focused for better accessibility
    // setExpandedIdx(idx);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="relative rounded-full p-2 text-blue-400 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500"
          aria-label="Accessibility Settings"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Settings style={{ width: 25, height: 25 }} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] p-0">
        <SheetTitle className="sr-only">Accessibility Settings</SheetTitle>
        <div className="flex flex-col h-full bg-white dark:bg-[#18191a] text-black dark:text-white transition-all duration-300">
          <div className="flex flex-col gap-2 p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-500" />
              <div>
                <div className="font-semibold text-lg">Accessibility</div>
                <div className="text-xs text-muted-foreground">Customize your experience</div>
              </div>
            </div>
            {/* Keyboard shortcuts info for drawer */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mt-2">
              <h4 className="font-medium text-sm mb-2 text-blue-700 dark:text-blue-300">Drawer Shortcuts:</h4>
              <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                <div>• <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded">Ctrl/Cmd + Alt + A</kbd> - Open/Close Drawer</div>
                <div>• <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded">Escape</kbd> - Close Drawer</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {/* Detailed instructions */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-300">📋 How to Toggle Settings & Use Keyboard Controls:</h4>
              <div className="space-y-3 text-xs text-green-600 dark:text-green-400">
                
                <div className="border-l-2 border-green-400 pl-3">
                  <strong>🔍 ZOOM CONTROLS:</strong>
                  <div className="mt-1 space-y-1">
                    <div><strong>Keyboard shortcuts:</strong></div>
                    <div>   • <kbd className="px-1 py-0.5 bg-green-200 dark:bg-green-800 rounded">Ctrl/Cmd + M</kbd> = Toggle Zoom</div>
                    <div>   • <kbd className="px-1 py-0.5 bg-green-200 dark:bg-green-800 rounded">Ctrl/Cmd + Alt + =</kbd> = Zoom In</div>
                    <div>   • <kbd className="px-1 py-0.5 bg-green-200 dark:bg-green-800 rounded">Ctrl/Cmd + Alt + -</kbd> = Zoom Out</div>
                    <div>   • <kbd className="px-1 py-0.5 bg-green-200 dark:bg-green-800 rounded">Ctrl/Cmd + Alt + 0</kbd> = Reset Zoom</div>
                  </div>
                </div>

                <div className="border-l-2 border-green-400 pl-3">
                  <strong>🔊 SCREEN READER:</strong>
                  <div className="mt-1 space-y-1">
                    <div><strong>Keyboard shortcuts:</strong></div>
                    <div>   • <kbd className="px-1 py-0.5 bg-green-200 dark:bg-green-800 rounded">Ctrl/Cmd + Alt + V</kbd> = Toggle On/Off</div>
                  </div>
                </div>

                <div className="border-l-2 border-green-400 pl-3">
                  <strong> HAPTIC FEEDBACK:</strong>
                  <div className="mt-1 space-y-1">
                    <div><strong>Keyboard shortcuts:</strong></div>
                    <div>   • <kbd className="px-1 py-0.5 bg-green-200 dark:bg-green-800 rounded">Ctrl/Cmd + Alt + H</kbd> = Toggle On/Off</div>
                  </div>
                </div>

              </div>
            </div>

            <div className="space-y-3" role="listbox" aria-label="Accessibility settings">
              {settings.map((setting, idx) => (
                <div
                  key={idx}
                  className={`bg-background border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition
                    ${expandedIdx === idx ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"}
                    cursor-pointer group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
                  tabIndex={0}
                  role="option"
                  aria-selected={expandedIdx === idx}
                  aria-expanded={expandedIdx === idx}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onFocus={() => handleFocus(idx)}
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {setting.title}
                        </span>
                        {/* Status indicator for keyboard shortcuts */}
                        {(setting.title === "Zoom" || setting.title === "Screen Reader" || setting.title === "Haptic Feedback") && (
                          <span className={`text-xs mt-1 ${
                            setting.enabled 
                              ? "text-green-600 dark:text-green-400" 
                              : "text-red-600 dark:text-red-400"
                          }`}>
                            {setting.enabled ? "✅ Keyboard shortcuts active" : "❌ Turn ON to use keyboard shortcuts"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        setting.enabled ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}>
                        {setting.value}
                      </span>
                    </div>
                  </div>
                  
                  {/* Expandable controls */}
                  {expandedIdx === idx && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                      {setting.control}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AccessibilityDrawer; 