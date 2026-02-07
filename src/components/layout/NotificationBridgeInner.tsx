'use client';

import { ReactNode } from 'react';
import { useTrackers } from '@/hooks/useTrackers';
import { useReminders } from '@/hooks/useReminders';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationContext } from '@/contexts/NotificationContext';

export default function NotificationBridgeInner({ children }: { children: ReactNode }) {
    const { data: trackers } = useTrackers();
    const { data: reminders } = useReminders();
    const { dueCount } = useNotifications(trackers, reminders);

    return (
        <NotificationContext.Provider value={{ dueCount }}>
            {children}
        </NotificationContext.Provider>
    );
}
