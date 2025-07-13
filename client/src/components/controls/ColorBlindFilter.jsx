import React from 'react';
import { useColorBlind, colorBlindFilters } from '../context/ColorBlindContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ColorBlindFilter = () => {
  const { currentFilter, setFilter, isEnabled, toggleEnabled } = useColorBlind();

  // Handler for enable/disable select
  const handleEnableChange = (value) => {
    if ((value === 'on' && !isEnabled) || (value === 'off' && isEnabled)) {
      toggleEnabled();
    }
  };

  return (
    <div className="flex items-center justify-end w-full gap-4">
      {/* Enable/Disable Select */}
      <Select value={isEnabled ? 'on' : 'off'} onValueChange={handleEnableChange}>
        <SelectTrigger
          className="w-20 bg-background text-foreground border border-border disabled:opacity-60"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="on">On</SelectItem>
          <SelectItem value="off">Off</SelectItem>
        </SelectContent>
      </Select>
      {/* Filter Select */}
      <Select value={currentFilter} onValueChange={setFilter} disabled={!isEnabled}>
        <SelectTrigger
          className="w-48 bg-background text-foreground border border-border disabled:opacity-60"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {colorBlindFilters.map((filter) => (
            <SelectItem key={filter.id} value={filter.id}>
              {filter.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ColorBlindFilter;