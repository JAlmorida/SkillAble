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
    small: { scale: 1, name: 'Small' },
    medium: { scale: 1.125, name: 'Medium' },
    large: { scale: 1.25, name: 'Large' },
};

export const ResizeProvider = ({ children, user }) => {
    const getKey = (key) => `${user?.id || "guest"}_${key}`;
    const [currentScale, setCurrentScale ] = useState('small');

    const { data: settings, isSuccess } = useGetSettingsQuery(undefined, { skip: !user });
    const [updateSettings] = useUpdateSettingsMutation();

    useEffect(() => {
        if (isSuccess && settings) {
            setCurrentScale(settings.accessibilityScale ?? 'small');
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

    const value = {
        currentScale, 
        changeScale, 
        scaleOption: SCALE_LEVELS, 
        currentScaleValue: SCALE_LEVELS[currentScale].scale, 
        currentScaleName: SCALE_LEVELS[currentScale].name 
    };

    return (
        <ResizeContext.Provider value={value}>
            {children}
        </ResizeContext.Provider>
    )
}