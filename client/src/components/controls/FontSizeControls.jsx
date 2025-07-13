import React from 'react';
import { useResize } from '../context/ResizeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const FontSizeControls = () => {
  const { currentScale, changeScale, scaleOption } = useResize();

  return (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium">Font Size</span>
      <Select value={currentScale} onValueChange={changeScale}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(scaleOption).map(([key, { name }]) => (
            <SelectItem key={key} value={key}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FontSizeControls;