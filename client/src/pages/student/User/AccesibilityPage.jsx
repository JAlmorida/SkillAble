import React from "react";
import Darkmode from "@/components/controls/Darkmode";
import FontSizeControls from "@/components/controls/FontSizeControls";
import ZoomControls from "@/components/controls/ZoomControls";
import ColorBlindFilter from "@/components/controls/ColorBlindFilter";
import ScreenReaderControls from "@/components/controls/ScreenReaderControls";
import FeedbackControls from "@/components/controls/FeedbackControls";
import { SunMoon, CaseSensitive, ZoomIn, PaintBucket, BookHeadphones, Vibrate, ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useZoom } from "@/components/context/ZoomProvider";
import { useColorBlind } from "@/components/context/ColorBlindContext";
import { useScreenReaderContext } from "@/components/context/ScreenReaderContext";
import { useFeedback } from "@/components/context/FeedbackContext";
import { useTheme } from "@/components/context/ThemeProvider";
import { useResize } from "@/components/context/ResizeContext";

const settings = [
  {
    icon: <SunMoon size={28} />,
    title: "Dark Mode",
    description: "Toggle light/dark theme",
    control: <Darkmode />,
  },
  {
    icon: <CaseSensitive size={28} />,
    title: "Font Size",
    description: "Adjust the font size for better readability",
    control: <FontSizeControls />,
  },
  {
    icon: <ZoomIn size={28} />,
    title: "Zoom Controls",
    description: "Zoom in or out for accessibility",
    control: <ZoomControls />,
  },
  {
    icon: <PaintBucket size={28} />,
    title: "Colorblind Filter",
    description: "Enable colorblind-friendly filters",
    control: <ColorBlindFilter />,
  },
  {
    icon: <BookHeadphones size={28} />,
    title: "Screen Reader",
    description: "Enable screen reader support",
    control: <ScreenReaderControls />,
  },
  {
    icon: <Vibrate size={28} />,
    title: "Haptic Feedback",
    description: "Enable or disable haptic feedback",
    control: <FeedbackControls />,
  },
];

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const AccessibilityPage = () => {
  const [expandedIdx, setExpandedIdx] = React.useState(null);

  // Get enabled states and selected values for each setting
  const zoomEnabled = useZoom().isZoomEnabled;
  const colorBlindEnabled = useColorBlind().isEnabled;
  const screenReaderEnabled = useScreenReaderContext().isEnabled;
  const feedbackEnabled = useFeedback().isEnabled;

  
  const { theme } = useTheme();

  const { currentScale, scaleOption } = useResize();

  const badgeValues = [
    themeLabels[theme] || "System", // Dark Mode
    scaleOption[currentScale]?.name || "Default", // Font Size
    zoomEnabled !== undefined ? (zoomEnabled ? "On" : "Off") : undefined,
    colorBlindEnabled !== undefined ? (colorBlindEnabled ? "On" : "Off") : undefined,
    screenReaderEnabled !== undefined ? (screenReaderEnabled ? "On" : "Off") : undefined,
    feedbackEnabled !== undefined ? (feedbackEnabled ? "On" : "Off") : undefined,
  ];

  const badgeColors = [
    "bg-green-600 text-white", // Dark Mode (always green)
    "bg-green-600 text-white", // Font Size (always green)
    zoomEnabled ? "bg-green-600 text-white" : "bg-red-600 text-white",
    colorBlindEnabled ? "bg-green-600 text-white" : "bg-red-600 text-white",
    screenReaderEnabled ? "bg-green-600 text-white" : "bg-red-600 text-white",
    feedbackEnabled ? "bg-green-600 text-white" : "bg-red-600 text-white",
  ];

  return (
    <div className="w-full mx-auto flex flex-col gap-4 py-8 px-2 sm:px-16">
      {settings.map((setting, idx) => (
        <div
          key={idx}
          className={`bg-background border border-gray-800 rounded-xl px-6 py-5 shadow-sm transition
            ${expandedIdx === idx ? "bg-primary/10 border-primary" : "hover:bg-primary/5"}
            cursor-pointer group`}
        >
          <div
            className="flex items-center justify-between gap-4"
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            style={{ userSelect: "none" }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-primary shrink-0">{setting.icon}</div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-lg group-hover:text-primary transition">{setting.title}</span>
                <span className="text-sm text-muted-foreground truncate">{setting.description}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Show badge if value is defined */}
              {badgeValues[idx] !== undefined && (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColors[idx]}`}>
                  {badgeValues[idx]}
                </span>
              )}
              {expandedIdx === idx ? (
                <ChevronDown className="text-muted-foreground" />
              ) : (
                <ChevronRight className="text-muted-foreground" />
              )}
            </div>
          </div>
          {/* Expandable controls */}
          {expandedIdx === idx && (
            <div className="mt-6 animate-fade-in">
              {setting.control}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccessibilityPage;
