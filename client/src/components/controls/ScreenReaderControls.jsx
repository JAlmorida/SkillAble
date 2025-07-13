import React from "react";
import { useScreenReaderContext } from "../context/ScreenReaderContext";

const ScreenReaderControls = () => {
  const {
    voiceSpeed,
    setVoiceSpeed,
    isEnabled,
    speechSupported,
    toggleScreenReader,
  } = useScreenReaderContext();

  if (!speechSupported) {
    return (
      <div className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg">
        <span className="text-sm font-medium">Speech not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end w-full gap-4">
      <button
        onClick={toggleScreenReader}
        className={`px-6 py-2 rounded font-semibold flex items-center gap-2 transition
          ${isEnabled ? "bg-green-600 text-white" : "bg-red-500 text-white"}`}
        aria-label={`${isEnabled ? "Disable" : "Enable"} screen reader`}
      >
        {isEnabled ? "ON" : "OFF"}
      </button>
      {isEnabled && (
        <div className="flex items-center gap-2 bg-black rounded-lg px-3 py-2">
          <label htmlFor="voice-speed" className="text-sm font-medium text-white">
            Speed:
          </label>
          <select
            id="voice-speed"
            value={voiceSpeed}
            onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
            className="bg-black border border-slate-700 rounded px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Voice speed setting"
          >
            <option value="0.5">Slow</option>
            <option value="1">Normal</option>
            <option value="1.5">Fast</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default ScreenReaderControls;