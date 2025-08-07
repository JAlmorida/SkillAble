import React from 'react';
import { useResize } from '../context/ResizeContext';
import { Slider } from '../ui/slider';

const FontSizeControls = () => {
  const { 
    currentScale, 
    changeScale, 
    scaleOption, 
    getScaleIndex, 
    getScaleKey, 
    totalScales 
  } = useResize();

  const currentIndex = getScaleIndex(currentScale);

  const handleSliderChange = (value) => {
    const newScaleKey = getScaleKey(value[0]);
    if (newScaleKey) {
      changeScale(newScaleKey);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium text-sm text-gray-300">Font Size</span>
      <div className="flex items-center gap-3">
        <Slider
          value={[currentIndex]}
          onValueChange={handleSliderChange}
          max={totalScales - 1}
          min={0}
          step={1}
          className="w-24"
        />
        <span className="text-xs text-gray-400 w-16 text-right">
          {scaleOption[currentScale].name}
        </span>
      </div>
    </div>
  );
};

export default FontSizeControls;