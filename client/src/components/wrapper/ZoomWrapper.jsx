import React, { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useZoom } from '../context/ZoomProvider';

export const ZoomWrapper = ({ children }) => {
  const { isZoomEnabled, zoomLevel } = useZoom();

  const containerRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [startScroll, setStartScroll] = useState({ x: 0, y: 0 });

  // Reset scroll position when zoom is toggled
  useEffect(() => {
    if (!isZoomEnabled && scrollAreaRef.current) {
      scrollAreaRef.current.scrollLeft = 0;
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [isZoomEnabled]);

  // Mouse event handlers for panning
  const handleMouseDown = (e) => {
    if (!isZoomEnabled) return;
    if (e.button !== 0) return; // Only left mouse button
    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY });
    setStartScroll({
      x: scrollAreaRef.current.scrollLeft,
      y: scrollAreaRef.current.scrollTop,
    });
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;
    scrollAreaRef.current.scrollLeft = startScroll.x - dx;
    scrollAreaRef.current.scrollTop = startScroll.y - dy;
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, startPan, startScroll]);

  if (!isZoomEnabled) {
    return (
      <div className="h-screen overflow-auto">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <div
        className="h-full w-full overflow-auto"
        ref={scrollAreaRef}
        style={{ width: '100%', height: '100%' }}
      >
        <div
          ref={containerRef}
          className="zoom-content-container"
          style={{
            cursor: isPanning ? 'grabbing' : 'grab',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            width: `${100 / zoomLevel}%`,
            height: `${100 / zoomLevel}%`,
            minHeight: `${100 * zoomLevel}vh`,
            minWidth: `${100 * zoomLevel}vw`,
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};