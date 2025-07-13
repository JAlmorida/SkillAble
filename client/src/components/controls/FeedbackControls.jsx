import React from "react";
import { useFeedback } from "../context/FeedbackContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";

const FeedbackControls = () => {
  const {
    isEnabled,
    setIsEnabled,
    audioEnabled,
    setAudioEnabled,
    vibrationEnabled,
    setVibrationEnabled,
    visualEnabled,
    setVisualEnabled,
    tapHoldDuration,
    setTapHoldDuration,
    intensity,
    setIntensity,
    voiceEnabled,
    setVoiceEnabled,
    voiceSpeed,
    setVoiceSpeed
  } = useFeedback();

  // Helper for select toggles
  const selectToggle = (value, setter) => (
    <Select value={value ? "enabled" : "disabled"} onValueChange={val => setter(val === "enabled")}>
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="enabled">Enable</SelectItem>
        <SelectItem value="disabled">Disable</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Enable/Disable */}
      <div className="flex items-center justify-between w-full">
        <span className="font-medium">Feedback System</span>
        <Select
          value={isEnabled ? "enabled" : "disabled"}
          onValueChange={val => setIsEnabled(val === "enabled")}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enabled">Enable</SelectItem>
            <SelectItem value="disabled">Disable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sub-controls */}
      <div className={`flex flex-col gap-3 ${!isEnabled ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-center justify-between w-full">
          <span>Audio Feedback</span>
          {selectToggle(audioEnabled, setAudioEnabled)}
        </div>
        <div className="flex items-center justify-between w-full">
          <span>Haptic Vibration</span>
          {selectToggle(vibrationEnabled, setVibrationEnabled)}
        </div>
        <div className="flex items-center justify-between w-full">
          <span>Visual Pulse</span>
          {selectToggle(visualEnabled, setVisualEnabled)}
        </div>
        <div className="flex items-center justify-between w-full">
          <span>Voice Feedback</span>
          {selectToggle(voiceEnabled, setVoiceEnabled)}
        </div>
        <div className="flex items-center justify-between w-full">
          <span>Feedback Intensity</span>
          <Select value={intensity} onValueChange={setIntensity}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subtle">Subtle</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="strong">Strong</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between w-full">
          <span>Tap & Hold Duration</span>
          <div className="flex items-center gap-2">
            <Slider
              value={[tapHoldDuration]}
              onValueChange={value => setTapHoldDuration(value[0])}
              min={200}
              max={1000}
              step={50}
              className="w-32"
            />
            <span className="text-xs">{tapHoldDuration}ms</span>
          </div>
        </div>
        {voiceEnabled && (
          <div className="flex items-center justify-between w-full">
            <span>Voice Speed</span>
            <Slider
              value={[voiceSpeed]}
              onValueChange={value => setVoiceSpeed(value[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-32"
            />
            <span className="text-xs">{voiceSpeed.toFixed(1)}x</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackControls;