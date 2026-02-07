'use client';

import { ReactNode, useMemo } from 'react';
import { useTrackers } from '@/hooks/useTrackers';
import { useReminders } from '@/hooks/useReminders';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationContext } from '@/contexts/NotificationContext';

export default function NotificationBridgeInner({ children }: { children: ReactNode }) {
    const { data: trackers } = useTrackers();
    const { data: reminders } = useReminders();
    const { dueCount } = useNotifications(trackers, reminders);

    const notificationValue = useMemo(() => ({ dueCount }), [dueCount]);

    return (
        <NotificationContext.Provider value={notificationValue}>
            {children}
        </NotificationContext.Provider>
    );
}
