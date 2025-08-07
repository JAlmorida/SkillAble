import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/features/api/userApi";
import React, { createContext, useContext, useEffect, useState } from "react";

const ResizeContext = createContext();

export const useResize = () => {
    const context = useContext(ResizeContext);
    if(!context) {
        throw new Error ('useResize must be used within a ResizeProvider')
    }
    return context;
}

const SCALE_LEVELS = {
    tiny: { scale: 0.75, name: 'Tiny' },
    small: { scale: 0.875, name: 'Small' },
    medium: { scale: 1, name: 'Medium' },
    large: { scale: 1.125, name: 'Large' },
    xlarge: { scale: 1.25, name: 'Extra Large' },
    xxlarge: { scale: 1.375, name: '2X Large' },
    huge: { scale: 1.5, name: 'Huge' },
    massive: { scale: 1.75, name: 'Massive' },
};

export const ResizeProvider = ({ children, user }) => {
    const getKey = (key) => `${user?.id || "guest"}_${key}`;
    const [currentScale, setCurrentScale] = useState('medium');

    const { data: settings, isSuccess } = useGetSettingsQuery(undefined, { skip: !user });
    const [updateSettings] = useUpdateSettingsMutation();

    useEffect(() => {
        if (isSuccess && settings) {
            setCurrentScale(settings.accessibilityScale ?? 'medium');
        }
    }, [isSuccess, settings]);

    useEffect(() => {
        if (!user || !isSuccess) return;
        updateSettings({ accessibilityScale: currentScale });
    }, [currentScale, user, isSuccess, updateSettings]);

    useEffect(() => {
        const savedScale = localStorage.getItem(getKey('accessibility-scale'));
        if (savedScale && SCALE_LEVELS[savedScale]) {
            setCurrentScale(savedScale);
        }
    }, [user]);

    useEffect(() => {
        const scaleValue = SCALE_LEVELS[currentScale].scale;
        const root = document.documentElement;

        root.style.setProperty('--accessibility-scale', scaleValue);
        root.style.setProperty('--accessibility-font-scale', scaleValue);
        root.style.setProperty('--accessibility-space-scale', scaleValue);
        root.style.setProperty('--accessibility-component-scale', scaleValue);

        localStorage.setItem(getKey('accessibility-scale'), currentScale);
    }, [currentScale, user]);

    const changeScale = (newScale) => {
        if (SCALE_LEVELS[newScale]) {
            setCurrentScale(newScale);
        }
    };

    // Get scale index for slider
    const getScaleIndex = (scaleKey) => {
        return Object.keys(SCALE_LEVELS).indexOf(scaleKey);
    };

    // Get scale key from index
    const getScaleKey = (index) => {
        return Object.keys(SCALE_LEVELS)[index];
    };

    const value = {
        currentScale, 
        changeScale, 
        scaleOption: SCALE_LEVELS, 
        currentScaleValue: SCALE_LEVELS[currentScale].scale, 
        currentScaleName: SCALE_LEVELS[currentScale].name,
        getScaleIndex,
        getScaleKey,
        totalScales: Object.keys(SCALE_LEVELS).length
    };

    return (
        <ResizeContext.Provider value={value}>
            {children}
        </ResizeContext.Provider>
    )
}