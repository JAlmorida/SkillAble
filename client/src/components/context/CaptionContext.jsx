import React, { createContext, useContext, useState } from "react";

const CaptionContext = createContext();

export const useCaption = () => useContext(CaptionContext);

export const CaptionProvider = ({ children }) => {
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const toggleCaptions = () => setCaptionsEnabled((prev) => !prev);

  return (
    <CaptionContext.Provider value={{ captionsEnabled, toggleCaptions }}>
      {children}
    </CaptionContext.Provider>
  );
};
