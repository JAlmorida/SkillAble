import React, { useState, useEffect } from 'react';
import { useZoom } from '../context/ZoomProvider';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactDOM from 'react-dom';

// The controls UI as a reusable component
const ZoomControlsPanel = ({ zoomLevel, updateZoomLevel }) => (
  <div className="flex flex-col items-center gap-2 mt-4">
    <span className="text-lg font-semibold">
      {(typeof zoomLevel === "number" ? zoomLevel : 1.1).toFixed(2)}x
    </span>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => updateZoomLevel(Math.max(1.1, (typeof zoomLevel === "number" ? zoomLevel : 1.1) - 0.1))}
        disabled={zoomLevel <= 1.1}
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => updateZoomLevel(Math.min(3, (typeof zoomLevel === "number" ? zoomLevel : 1.1) + 0.1))}
        disabled={zoomLevel >= 3}
        aria-label="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => updateZoomLevel(1.5)}
        aria-label="Reset"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>
    </div>
  </div>
);

// The floating panel rendered via portal
const FloatingZoomPanel = ({ zoomLevel, updateZoomLevel, onClose }) => {
  const panel = (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-[9999] bg-background/90 border border-border rounded-xl shadow-lg p-4 flex flex-col items-center gap-4"
      style={{ minWidth: 180 }}
    >
      <button
        className="absolute top-2 right-2 text-muted-foreground"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
      <ZoomControlsPanel zoomLevel={zoomLevel} updateZoomLevel={updateZoomLevel} />
    </div>
  );
  return ReactDOM.createPortal(panel, document.body);
};

const ZoomControls = () => {
  const { isZoomEnabled, zoomLevel, toggleZoom, updateZoomLevel } = useZoom();
  const [showFloatingPanel, setShowFloatingPanel] = useState(isZoomEnabled);

  // Sync floating panel with zoom enabled state
  useEffect(() => {
    if (isZoomEnabled) setShowFloatingPanel(true);
    else setShowFloatingPanel(false);
  }, [isZoomEnabled]);

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-end w-full gap-4">
          <Select
            value={isZoomEnabled ? 'on' : 'off'}
            onValueChange={(value) => {
              if ((value === 'on' && !isZoomEnabled) || (value === 'off' && isZoomEnabled)) {
                toggleZoom();
              }
              if (value === 'on') setShowFloatingPanel(true);
              if (value === 'off') setShowFloatingPanel(false);
            }}
          >
            <SelectTrigger className="w-20 bg-background text-foreground border border-border disabled:opacity-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on">On</SelectItem>
              <SelectItem value="off">Off</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Show controls in the settings card when enabled */}
        {isZoomEnabled && (
          <ZoomControlsPanel zoomLevel={zoomLevel} updateZoomLevel={updateZoomLevel} />
        )}
      </div>
      {/* Only show the floating panel if both zoom is enabled and the panel is not closed */}
      {isZoomEnabled && showFloatingPanel && (
        <FloatingZoomPanel
          zoomLevel={zoomLevel}
          updateZoomLevel={updateZoomLevel}
          onClose={() => setShowFloatingPanel(false)}
        />
      )}
    </>
  );
};

export default ZoomControls;