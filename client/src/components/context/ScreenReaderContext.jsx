import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/api/userApi';
import { createContext, useContext, useState, useEffect } from 'react';

const ScreenReaderContext = createContext();

export const useScreenReaderContext = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReaderContext must be used within a ScreenReaderProvider');
  }
  return context;
};

export const ScreenReaderProvider = ({ children, user }) => {
  const getKey = (key) => `${user?.id || "guest"}_${key}`;
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [isReading, setIsReading] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // Simple state for highlighting
  const [currentText, setCurrentText] = useState('');
  const [highlightedElement, setHighlightedElement] = useState(null);

  const { data: settings, isSuccess } = useGetSettingsQuery(undefined, { skip: !user });
  const [updateSettings] = useUpdateSettingsMutation();

  useEffect(() => {
    // Check if Web Speech API is supported
    setSpeechSupported('speechSynthesis' in window);
    
    // Load saved voice speed from localStorage
    const savedSpeed = localStorage.getItem(getKey('screenReaderVoiceSpeed'));
    if (savedSpeed) {
      setVoiceSpeed(parseFloat(savedSpeed));
    }
    
    // Load saved enabled state from localStorage
    const savedEnabled = localStorage.getItem(getKey('screenReaderEnabled'));
    if (savedEnabled) {
      setIsEnabled(savedEnabled === 'true');
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess && settings) {
      setIsEnabled(settings.screenReaderEnabled ?? false);
      setVoiceSpeed(settings.screenReaderVoiceSpeed ?? 1);
    }
  }, [isSuccess, settings]);

  useEffect(() => {
    if (!user || !isSuccess) return;
    updateSettings({
      screenReaderEnabled: isEnabled,
      screenReaderVoiceSpeed: voiceSpeed,
    });
  }, [isEnabled, voiceSpeed, user, isSuccess, updateSettings]);

  useEffect(() => {
    // Save voice speed to localStorage
    localStorage.setItem(getKey('screenReaderVoiceSpeed'), voiceSpeed.toString());
  }, [voiceSpeed, user]);

  useEffect(() => {
    // Save enabled state to localStorage
    localStorage.setItem(getKey('screenReaderEnabled'), isEnabled.toString());
  }, [isEnabled, user]);

  useEffect(() => {
    // Handle page visibility changes to stop reading when page is hidden
    const handleVisibilityChange = () => {
      if (document.hidden && isReading) {
        stopReading();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isReading]);

  // Keyboard shortcuts implementation in the context
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + Alt + V to toggle screen reader
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'v') {
        event.preventDefault();
        toggleScreenReader();
      }
      
      // Ctrl/Cmd + Alt + R to read current element
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'r') {
        event.preventDefault();
        const activeElement = document.activeElement;
        if (activeElement && activeElement.textContent && isEnabled) {
          readText(activeElement.textContent, activeElement);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled]);

  // Helper function to extract text from any element
  const extractTextFromElement = (element) => {
    if (!element) return '';

    const tagName = element.tagName.toLowerCase();
    let text = '';

    switch (tagName) {
      case 'input': {
        const placeholder = element.placeholder || '';
        const value = element.value || '';
        text = placeholder;
        if (value && value !== placeholder) {
          text += (text ? '. Current value: ' : 'Current value: ') + value;
        }
        break;
      }
      case 'textarea': {
        text = element.value || element.placeholder || '';
        break;
      }
      case 'button': {
        text = element.textContent || element.innerText || '';
        break;
      }
      case 'label': {
        text = element.textContent || element.innerText || '';
        break;
      }
      case 'img': {
        text = element.alt || 'Image';
        break;
      }
      case 'a': {
        text = element.textContent || element.innerText || element.href;
        break;
      }
      default: {
        // For other elements, extract all text content
        const clone = element.cloneNode(true);
        
        // Remove volume icons and other non-content elements
        const volumeIcons = clone.querySelectorAll('.fa-volume-up, [data-lucide="volume-2"], svg[data-testid="volume-icon"]');
        volumeIcons.forEach(icon => icon.remove());
        
        // Remove other UI elements that shouldn't be read
        const uiElements = clone.querySelectorAll('.sr-only, [aria-hidden="true"]');
        uiElements.forEach(el => el.remove());
        
        text = clone.textContent || clone.innerText || '';
        break;
      }
    }

    // Clean up text (remove extra whitespace)
    return text.replace(/\s+/g, ' ').trim();
  };

  const stopReading = () => {
    if (speechSupported && speechSynthesis) {
      speechSynthesis.cancel();
      // Force clear the speech queue
      speechSynthesis.cancel();
    }
    
    setIsReading(false);
    setCurrentUtterance(null);
    setCurrentText('');
    
    // Remove highlighting from current element
    if (highlightedElement) {
      highlightedElement.classList.remove('screen-reader-reading');
      setHighlightedElement(null);
    }
  };

  const readText = (text, element = null) => {
    if (!speechSupported) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    if (!isEnabled) {
      return; // Screen reader is disabled
    }

    if (isReading) {
      stopReading();
      return;
    }

    if (!text || text.trim() === '') return;

    // Clean up text (remove extra whitespace)
    const cleanText = text.replace(/\s+/g, ' ').trim();
    setCurrentText(cleanText);

    // Highlight the element being read
    if (element) {
      element.classList.add('screen-reader-reading');
      setHighlightedElement(element);
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsReading(true);
    };

    utterance.onend = () => {
      setIsReading(false);
      setCurrentUtterance(null);
      setCurrentText('');
      
      // Remove highlighting
      if (highlightedElement) {
        highlightedElement.classList.remove('screen-reader-reading');
        setHighlightedElement(null);
      }
    };

    utterance.onerror = (event) => {
      // Don't log interrupted errors as they're expected when stopping
      if (event.error !== 'interrupted') {
        console.error('Speech synthesis error:', event.error);
      }
      setIsReading(false);
      setCurrentUtterance(null);
      setCurrentText('');
      
      // Remove highlighting
      if (highlightedElement) {
        highlightedElement.classList.remove('screen-reader-reading');
        setHighlightedElement(null);
      }
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  const toggleScreenReader = () => {
    setIsEnabled(prev => !prev);
  };

  // Global click and double-click listeners for automatic screen reading
  useEffect(() => {
    if (!isEnabled) return;

    const handleGlobalClick = (event) => {
      const target = event.target;
      
      // Skip if target is a button or input in screen reader controls
      if (target.closest('[data-screen-reader-controls]')) {
        return;
      }

      // Skip if target is a script, style, or non-interactive element
      const skipTags = ['script', 'style', 'meta', 'link', 'title'];
      if (skipTags.includes(target.tagName.toLowerCase())) {
        return;
      }

      // Extract text content from the clicked element
      let text = extractTextFromElement(target);
      
      if (text && text.trim()) {
        // Add visual feedback
        target.classList.add('screen-reader-active');
        setTimeout(() => {
          target.classList.remove('screen-reader-active');
        }, 200);
        
        readText(text, target);
      }
    };

    const handleGlobalDoubleClick = (event) => {
      // Prevent default double-click behavior
      event.preventDefault();
      event.stopPropagation();
      
      // Always stop reading on double click - anywhere on the page, including components
      // Don't check if currently reading, just force stop
      if (speechSupported && speechSynthesis) {
        speechSynthesis.cancel();
        // Call cancel multiple times to ensure it stops completely
        setTimeout(() => speechSynthesis.cancel(), 10);
        setTimeout(() => speechSynthesis.cancel(), 50);
      }
      
      // Immediately update state
      setIsReading(false);
      setCurrentUtterance(null);
      setCurrentText('');
      
      // Remove highlighting
      if (highlightedElement) {
        highlightedElement.classList.remove('screen-reader-reading');
        setHighlightedElement(null);
      }
      
      // Add visual feedback to indicate stopping
      const target = event.target;
      target.classList.add('screen-reader-stopped');
      setTimeout(() => {
        target.classList.remove('screen-reader-stopped');
      }, 300);
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('dblclick', handleGlobalDoubleClick);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('dblclick', handleGlobalDoubleClick);
    };
  }, [isEnabled, isReading, highlightedElement]);

  const value = {
    voiceSpeed,
    setVoiceSpeed,
    isReading,
    speechSupported,
    isEnabled,
    toggleScreenReader,
    readText,
    stopReading,
    setIsReading,
    setCurrentUtterance,
    currentText
  };

  return (
    <ScreenReaderContext.Provider value={value}>
      {children}
    </ScreenReaderContext.Provider>
  );
};
