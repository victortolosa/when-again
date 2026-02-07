import { useEffect, useState, useCallback, useRef } from 'react';
import type { Tracker, Reminder } from '@/lib/types';
import { updateBadge } from '@/lib/badge';
import {
    isSupported,
    getPermissionStatus,
    requestPermission as reqPerm,
    sendNotification,
    getNotifiedIds,
    markNotified,
    clearStaleNotifications,
} from '@/lib/notifications';

const CHECK_INTERVAL = 60_000;

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isAnniversaryToday(targetDate: Date, today: Date): boolean {
    return (
        targetDate.getMonth() === today.getMonth() &&
        targetDate.getDate() === today.getDate()
    );
}

function humanLeadTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) {
        const hrs = Math.round(minutes / 60);
        return `${hrs} hour${hrs > 1 ? 's' : ''}`;
    }
    const days = Math.round(minutes / 1440);
    return `${days} day${days > 1 ? 's' : ''}`;
}

function getDueItems(
    trackers: Tracker[] | undefined,
    reminders: Reminder[] | undefined
): { id: string; title: string; kind: string; body?: string }[] {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due: { id: string; title: string; kind: string; body?: string }[] = [];

    if (reminders) {
        for (const r of reminders) {
            const d = r.date.toDate();
            if (r.notify_before) {
                const notifyAt = new Date(d.getTime() - r.notify_before * 60_000);
                if (now >= notifyAt) {
                    const isEarly = now < d;
                    due.push({
                        id: r.id,
                        title: r.title,
                        kind: 'reminder',
                        body: isEarly
                            ? `Coming up in ${humanLeadTime(r.notify_before)}`
                            : undefined,
                    });
                }
            } else {
                const dDay = new Date(d);
                dDay.setHours(0, 0, 0, 0);
                if (dDay <= today) {
                    due.push({ id: r.id, title: r.title, kind: 'reminder' });
                }
            }
        }
    }

    if (trackers) {
        for (const t of trackers) {
            const d = t.target_date.toDate();
            if (t.type === 'till') {
                const target = new Date(d);
                target.setHours(0, 0, 0, 0);
                if (isSameDay(target, today) || target <= today) {
                    due.push({ id: t.id, title: t.title, kind: 'countdown' });
                }
            } else if (t.type === 'since') {
                if (isAnniversaryToday(d, today)) {
                    due.push({ id: t.id, title: t.title, kind: 'milestone' });
                }
            }
        }
    }

    return due;
}

export function useNotifications(
    trackers: Tracker[] | undefined,
    reminders: Reminder[] | undefined
) {
    const [dueCount, setDueCount] = useState(0);
    const [permissionStatus, setPermissionStatus] = useState<
        NotificationPermission | 'unsupported'
    >('default');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setPermissionStatus(getPermissionStatus());
    }, []);

    const check = useCallback(() => {
        const items = getDueItems(trackers, reminders);
        setDueCount(items.length);

        // Update app badge
        updateBadge(items.length).catch(() => {});

        // Send notifications for newly due items
        if (isSupported() && Notification.permission === 'granted') {
            const notified = getNotifiedIds();
            for (const item of items) {
                if (!notified.has(item.id)) {
                    const body = item.body
                        ?? (item.kind === 'reminder'
                            ? 'This reminder is due'
                            : item.kind === 'countdown'
                              ? 'This countdown has arrived'
                              : 'Anniversary today!');
                    sendNotification(item.title, {
                        body,
                        tag: item.id,
                        data: { url: '/' },
                    }).catch(() => {});
                    markNotified(item.id);
                }
            }
        }

        clearStaleNotifications();
    }, [trackers, reminders]);

    useEffect(() => {
        check();
        intervalRef.current = setInterval(check, CHECK_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [check]);

    const requestPermission = useCallback(async () => {
        const result = await reqPerm();
        setPermissionStatus(result);
        return result;
    }, []);

    return { dueCount, permissionStatus, requestPermission };
}
