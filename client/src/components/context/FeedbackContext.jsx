import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/features/api/userApi";
import { createContext, useContext, useState, useEffect, useRef } from "react";

const FeedbackContext = createContext();

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
};

export const FeedbackProvider = ({ children, user }) => {
  const getKey = (key) => `${user?.id || "guest"}_${key}`;

  const { data: settings, isSuccess } = useGetSettingsQuery(undefined, { skip: !user });
  const [updateSettings] = useUpdateSettingsMutation();

  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem(getKey("accessibilityEnabled"));
    return saved !== null ? saved === "true" : false;
  });

  const [audioEnabled, setAudioEnabled] = useState(() => {
    const saved = localStorage.getItem(getKey("audioEnabled"));
    return saved !== null ? saved === "true" : false;
  });

  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem(getKey("vibrationEnabled"));
    return saved !== null ? saved === "true" : false;
  });

  const [visualEnabled, setVisualEnabled] = useState(() => {
    const saved = localStorage.getItem(getKey("visualEnabled"));
    return saved !== null ? saved === "true" : false;
  });

  const [tapHoldDuration, setTapHoldDuration] = useState(() => {
    const saved = localStorage.getItem(getKey("tapHoldDuration"));
    return saved !== null ? parseInt(saved) : 500;
  });

  const [intensity, setIntensity] = useState(() => {
    const saved = localStorage.getItem(getKey("feedbackIntensity"));
    return saved !== null ? saved : "normal";
  });

  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem(getKey("voiceEnabled"));
    return saved !== null ? saved === "true" : false;
  });

  const [voiceSpeed, setVoiceSpeed] = useState(() => {
    const saved = localStorage.getItem(getKey("voiceSpeed"));
    return saved !== null ? parseFloat(saved) : 1.2;
  });

  const audioContextRef = useRef(null);
  const touchTimerRef = useRef(null);
  const lastInteractionRef = useRef(0);
  const speechSynthRef = useRef(null);

  useEffect(() => {
    if (isSuccess && settings) {
      setIsEnabled(settings.accessibilityEnabled ?? false);
      setAudioEnabled(settings.audioEnabled ?? false);
      setVibrationEnabled(settings.vibrationEnabled ?? false);
      setVisualEnabled(settings.visualEnabled ?? false);
      setTapHoldDuration(settings.tapHoldDuration ?? 500);
      setIntensity(settings.feedbackIntensity ?? "normal");
      setVoiceEnabled(settings.voiceEnabled ?? false);
      setVoiceSpeed(settings.voiceSpeed ?? 1.2);
    }
  }, [isSuccess, settings]);

  useEffect(() => {
    if (!user || !isSuccess) return;
    updateSettings({
      accessibilityEnabled: isEnabled,
      audioEnabled,
      vibrationEnabled,
      visualEnabled,
      tapHoldDuration,
      feedbackIntensity: intensity,
      voiceEnabled,
      voiceSpeed,
    });
  }, [
    isEnabled, audioEnabled, vibrationEnabled, visualEnabled,
    tapHoldDuration, intensity, voiceEnabled, voiceSpeed,
    user, isSuccess, updateSettings,
  ]);

  useEffect(() => {
    localStorage.setItem(getKey("accessibilityEnabled"), isEnabled.toString());
  }, [isEnabled, user]);

  useEffect(() => {
    localStorage.setItem(getKey("audioEnabled"), audioEnabled.toString());
  }, [audioEnabled, user]);

  useEffect(() => {
    localStorage.setItem(getKey("vibrationEnabled"), vibrationEnabled.toString());
  }, [vibrationEnabled, user]);

  useEffect(() => {
    localStorage.setItem(getKey("visualEnabled"), visualEnabled.toString());
  }, [visualEnabled, user]);

  useEffect(() => {
    localStorage.setItem(getKey("tapHoldDuration"), tapHoldDuration.toString());
  }, [tapHoldDuration, user]);

  useEffect(() => {
    localStorage.setItem(getKey("feedbackIntensity"), intensity);
  }, [intensity, user]);

  useEffect(() => {
    localStorage.setItem(getKey("voiceEnabled"), voiceEnabled.toString());
  }, [voiceEnabled, user]);

  useEffect(() => {
    localStorage.setItem(getKey("voiceSpeed"), voiceSpeed.toString());
  }, [voiceSpeed, user]);

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      } catch (error) {
        console.log("Audio context not available");
      }
    }
  };

  // Play UI sound with different tones for different interactions
  const playUISound = (interactionType = "click") => {
    if (!isEnabled || !audioEnabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different sound profiles for different interactions
      const soundProfiles = {
        click: {
          subtle: { start: 800, end: 400, duration: 0.12 },
          normal: { start: 1000, end: 500, duration: 0.15 },
          strong: { start: 1200, end: 600, duration: 0.18 },
        },
        hover: {
          subtle: { start: 600, end: 500, duration: 0.08 },
          normal: { start: 700, end: 600, duration: 0.1 },
          strong: { start: 800, end: 700, duration: 0.12 },
        },
        focus: {
          subtle: { start: 500, end: 700, duration: 0.1 },
          normal: { start: 600, end: 800, duration: 0.12 },
          strong: { start: 700, end: 900, duration: 0.15 },
        },
        hold: {
          subtle: { start: 400, end: 600, duration: 0.2 },
          normal: { start: 500, end: 700, duration: 0.25 },
          strong: { start: 600, end: 800, duration: 0.3 },
        },
        keyboard: {
          subtle: { start: 900, end: 500, duration: 0.08 },
          normal: { start: 1100, end: 600, duration: 0.1 },
          strong: { start: 1300, end: 700, duration: 0.12 },
        },
      };

      const volumes = {
        subtle: 0.04,
        normal: 0.08,
        strong: 0.12,
      };

      const profile = soundProfiles[interactionType] || soundProfiles.click;
      const freq = profile[intensity] || profile.normal;
      const volume = volumes[intensity] || volumes.normal;

      // Set waveform based on interaction type
      if (interactionType === "click" || interactionType === "keyboard") {
        oscillator.type = "sine"; // Sharp, clear tone for clicks
      } else if (interactionType === "hover") {
        oscillator.type = "triangle"; // Softer tone for hover
      } else if (interactionType === "focus") {
        oscillator.type = "square"; // Distinctive tone for focus
      } else {
        oscillator.type = "sawtooth"; // Rich tone for tap-and-hold
      }

      oscillator.frequency.setValueAtTime(freq.start, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        freq.end,
        ctx.currentTime + freq.duration,
      );

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + freq.duration,
      );

      oscillator.start();
      oscillator.stop(ctx.currentTime + freq.duration);
    } catch (error) {
      console.log("Audio feedback failed");
    }
  };

  // Text-to-speech for keyboard input
  const speakText = (text) => {
    if (!isEnabled || !voiceEnabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.volume =
      intensity === "subtle" ? 0.3 : intensity === "normal" ? 0.5 : 0.7;
    utterance.pitch = 1;

    // Use a shorter, more responsive voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang.startsWith("en") &&
          (voice.name.includes("Google") || voice.name.includes("Microsoft")),
      ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Get readable key name
  const getKeyName = (key) => {
    const keyMap = {
      " ": "space",
      Enter: "enter",
      Backspace: "backspace",
      Delete: "delete",
      Tab: "tab",
      Escape: "escape",
      ArrowUp: "up arrow",
      ArrowDown: "down arrow",
      ArrowLeft: "left arrow",
      ArrowRight: "right arrow",
      Shift: "shift",
      Control: "control",
      Alt: "alt",
      Meta: "command",
      CapsLock: "caps lock",
      F1: "F1",
      F2: "F2",
      F3: "F3",
      F4: "F4",
      F5: "F5",
      F6: "F6",
      F7: "F7",
      F8: "F8",
      F9: "F9",
      F10: "F10",
      F11: "F11",
      F12: "F12",
    };

    if (keyMap[key]) {
      return keyMap[key];
    }

    // For letters and numbers, return them as-is but make them more pronounceable
    if (key.length === 1) {
      if (/[a-zA-Z]/.test(key)) {
        return key.toLowerCase();
      }
      if (/[0-9]/.test(key)) {
        return key;
      }
      // For symbols, try to make them readable
      const symbolMap = {
        "!": "exclamation",
        "@": "at",
        "#": "hash",
        $: "dollar",
        "%": "percent",
        "^": "caret",
        "&": "and",
        "*": "asterisk",
        "(": "left parenthesis",
        ")": "right parenthesis",
        "-": "dash",
        _: "underscore",
        "=": "equals",
        "+": "plus",
        "[": "left bracket",
        "]": "right bracket",
        "{": "left brace",
        "}": "right brace",
        "\\": "backslash",
        "|": "pipe",
        ";": "semicolon",
        ":": "colon",
        "'": "apostrophe",
        '"': "quote",
        ",": "comma",
        ".": "period",
        "/": "slash",
        "?": "question mark",
        "<": "less than",
        ">": "greater than",
        "`": "backtick",
        "~": "tilde",
      };
      return symbolMap[key] || key;
    }

    return key;
  };

  // Trigger vibration
  const triggerVibration = (type = "click") => {
    if (!isEnabled || !vibrationEnabled || !navigator.vibrate) return;

    const vibrationPatterns = {
      subtle: type === "click" ? 30 : 20,
      normal: type === "click" ? 50 : 30,
      strong: type === "click" ? 80 : 50,
    };

    const duration = vibrationPatterns[intensity] || vibrationPatterns.normal;
    navigator.vibrate(duration);
  };

  // Apply visual pulse
  const applyVisualPulse = (element) => {
    if (!isEnabled || !visualEnabled) return;

    element.classList.add("pulse-highlight");
    setTimeout(() => {
      element.classList.remove("pulse-highlight");
    }, 600);
  };

  // Check if element is interactive
  const isInteractiveElement = (element) => {
    const interactiveSelectors = [
      "button",
      "input",
      "select",
      "textarea",
      "a",
      '[role="button"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[tabindex]:not([tabindex="-1"])',
      ".demo-interaction",
      ".cursor-pointer",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "li",
      "span[onclick]",
      "div[onclick]",
      "[data-interactive]",
    ];

    return interactiveSelectors.some((selector) => {
      try {
        return element.matches && element.matches(selector);
      } catch (e) {
        return false;
      }
    });
  };

  // Provide comprehensive feedback
  const provideFeedback = (element, type = "click") => {
    if (!isEnabled) return;

    // Throttle rapid interactions
    const now = Date.now();
    if (now - lastInteractionRef.current < 50) return;
    lastInteractionRef.current = now;

    applyVisualPulse(element);
    playUISound(type);
    triggerVibration(type);
  };

  // Event handlers
  const handleClick = (e) => {
    if (isInteractiveElement(e.target)) {
      provideFeedback(e.target, "click");
    }
  };

  const handleMouseOver = (e) => {
    if (isInteractiveElement(e.target)) {
      provideFeedback(e.target, "hover");
    }
  };

  const handleTouchStart = (e) => {
    if (isInteractiveElement(e.target)) {
      touchTimerRef.current = setTimeout(() => {
        provideFeedback(e.target, "hold");
      }, tapHoldDuration);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  // Focus and keyboard interactions
  const handleFocus = (e) => {
    if (isInteractiveElement(e.target)) {
      provideFeedback(e.target, "focus");
    }
  };

  const handleKeyDown = (e) => {
    // Handle keyboard feedback for interactive elements
    if (
      (e.key === "Enter" || e.key === " ") &&
      isInteractiveElement(e.target)
    ) {
      provideFeedback(e.target, "keyboard");
    }

    // Handle text-to-speech for all keyboard input
    if (voiceEnabled && isEnabled) {
      // Skip modifier keys when pressed alone
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
        return;
      }

      // Skip if it's a modifier combination
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      const keyName = getKeyName(e.key);
      speakText(keyName);
    }
  };

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initOnInteraction = () => {
      initAudioContext();
      document.removeEventListener("click", initOnInteraction);
      document.removeEventListener("touchstart", initOnInteraction);
    };

    document.addEventListener("click", initOnInteraction, { once: true });
    document.addEventListener("touchstart", initOnInteraction, { once: true });

    // Global event listeners with capture phase for better coverage
    document.addEventListener("click", handleClick, true);
    document.addEventListener("mouseenter", handleMouseOver, true);
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchend", handleTouchEnd, {
      passive: true,
      capture: true,
    });
    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("mouseenter", handleMouseOver, true);
      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("touchend", handleTouchEnd, true);
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("keydown", handleKeyDown, true);

      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };
  }, [
    isEnabled,
    audioEnabled,
    vibrationEnabled,
    visualEnabled,
    tapHoldDuration,
    intensity,
    voiceEnabled,
    voiceSpeed,
    user,
  ]);

  const value = {
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
    setVoiceSpeed,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

export { FeedbackContext };