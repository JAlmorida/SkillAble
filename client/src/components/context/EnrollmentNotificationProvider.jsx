import React, { createContext, useContext, useState } from "react";

export const EnrollmentNotificationContext = createContext();

export const EnrollmentNotificationProvider = ({ children }) => {
    const [ enrollmentNotifications, setEnrollmentNotifications ] = useState([]);

    const addEnrollmentNotification = (enrollmentData) => {
        const notification = {
            id: `enrollment-${Date.now()}-${Math.random()}`, 
            type: 'enrollment', 
            ...enrollmentData, 
            createdAt: new Date().toISOString()
        };
        setEnrollmentNotifications(prev => [notification, ...prev])
    }

    const removeEnrollmentNotifications = () => {
        setEnrollmentNotifications([])
    };

    const clearEnrollmentNotifications = () => {
        setEnrollmentNotifications([]);
    }

    return(
        <EnrollmentNotificationContext.Provider value={{
            enrollmentNotifications,
            addEnrollmentNotification,
            removeEnrollmentNotifications,
            clearEnrollmentNotifications
        }}>
            {children}
        </EnrollmentNotificationContext.Provider>
    )
}

export const useEnrollmentNotifications = () => useContext(EnrollmentNotificationContext)