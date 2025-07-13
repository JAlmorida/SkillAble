import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/api/userApi';
import React, { createContext, useEffect, useState } from 'react'
import { useContext } from 'react';

export const colorBlindFilters = [
    {
        id: 'none',
        name: 'Normal Vision',
        description: 'No color vision filter applied',
        filter: 'none'
    },
    {
        id: 'protanopia',
        name: 'Protanopia',
        description: 'Red-Blind (missing L-cones)',
        filter: 'sepia(100%) hue-rotate(180deg) saturate(200%) contrast(120%)'
    },
    {
        id: 'deuteranopia',
        name: 'Deuteranopia',
        description: 'Green-blind (Missing M-cones)',
        filter: 'sepia(100%) hue-rotate(90deg) saturate(150%) contrast(110%)'
    },
    {
        id: 'tritanopia',
        name: 'Tritanopia',
        description: 'Blue-blind (Missing S-cones)',
        filter: 'sepia(100%) hue-rotate(270deg) saturate(180%) contrast(115%)'
    },
    {
        id: 'achromatopsia',
        name: 'Achromtopsia',
        description: 'Complete color blindness',
        filter: 'grayscale(100%) contrast(120%)',
    },
    {
        id: 'protonomaly',
        name: 'Protonomaly',
        description: 'Reduced red sensitivity',
        filter: 'sepia(50%) hue-rotate(180deg) saturate(120%) contrast(105%)'
    },
    {
        id: 'deuteranomaly',
        name: 'Deuteranomaly',
        description: 'Reduced green sensitivity',
        filter: 'sepia(50%) hue-rotate(90deg) saturate(110%) contrast(105%)'
    },
    {
        id: 'tritanomaly',
        name: 'Tritanomaly',
        description: 'Reduces blue sensitivity',
        filter: 'sepia(50%) hue-rotate(270deg) saturate(130%) contrast(105%)'
    },
];

const ColorBlindContext = createContext(undefined);

export const useColorBlind = () => {
    const context = useContext(ColorBlindContext);
    if (!context) {
        throw new Error('useColorBlind must be used within a ColorBlindProvider')
    }
    return context;
}

export const ColorBlindProvider = ({ children, user }) => {
    const getKey = (key) => `${user?.id || "guest"}_${key}`;
    const [currentFilter, setCurrentFilter] = useState('none');
    const [isEnabled, setIsEnabled] = useState(false);

    const { data: settings, isSuccess } = useGetSettingsQuery(undefined, { skip: !user });
    const [updateSettings] = useUpdateSettingsMutation();

    useEffect(() => {
        if (isSuccess && settings) {
            setCurrentFilter(settings.colorblindFilter ?? 'none');
            setIsEnabled(settings.colorblindEnabled ?? false);
        }
    }, [isSuccess, settings]);

    useEffect(() => {
        if (!user || !isSuccess) return;
        updateSettings({
            colorblindFilter: currentFilter,
            colorblindEnabled: isEnabled,
        });
    }, [currentFilter, isEnabled, user, isSuccess, updateSettings]);

    useEffect(() => {
        const root = document.documentElement;
        const filter = colorBlindFilters.find(f => f.id === currentFilter);

        if (isEnabled && filter && filter.id !== 'none') {
            root.style.filter = filter.filter;
            root.style.filter = 'filter 0.3s ease-in-out';
        } else {
            root.style.filter = 'none';
        }

        return () => {
            root.style.filter = 'none';
        };
    }, [currentFilter, isEnabled]);

    const setFilter = (filter) => {
        setCurrentFilter(filter);
        console.log('Colorblind filter chnaged to:', filter);
    };

    const toggleEnabled = () => {
        const newEnabled = !isEnabled;
        setIsEnabled(newEnabled);
        console.log('Colorblind filter enabled:', newEnabled);
    }

    return (
        <ColorBlindContext.Provider
            value={{
                currentFilter,
                setFilter,
                isEnabled,
                toggleEnabled
            }}
        >
            { children }
        </ColorBlindContext.Provider>
    )
}