'use client';

import { createContext, useContext } from 'react';

export interface NotificationContextType {
    dueCount: number;
}

export const NotificationContext = createContext<NotificationContextType>({ dueCount: 0 });

export function useNotificationBadge() {
    return useContext(NotificationContext);
}
