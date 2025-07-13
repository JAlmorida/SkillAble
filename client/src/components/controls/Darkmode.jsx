import React from 'react';
import { useTheme } from '../context/ThemeProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const Darkmode = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium">Theme</span>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Darkmode;