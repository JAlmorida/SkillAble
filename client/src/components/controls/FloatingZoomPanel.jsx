// FloatingZoomPanel.jsx
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FloatingZoomPanel = ({ zoomLevel, updateZoomLevel, onClose }) => {
  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[9999] bg-background/90 border border-border rounded-xl shadow-lg p-4 flex flex-col items-center gap-4"
      style={{ minWidth: 220 }}
    >
      <button
        className="absolute top-2 right-2 text-muted-foreground"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base font-semibold">
          {(typeof zoomLevel === "number" ? zoomLevel : 1.1).toFixed(2)}x
        </span>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateZoomLevel(Math.max(1.1, (typeof zoomLevel === "number" ? zoomLevel : 1.1) - 0.1))}
          disabled={zoomLevel <= 1.1}
        >
          Zoom Out
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateZoomLevel(Math.min(3, (typeof zoomLevel === "number" ? zoomLevel : 1.1) + 0.1))}
          disabled={zoomLevel >= 3}
        >
          Zoom In
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateZoomLevel(1.5)}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default FloatingZoomPanel;
