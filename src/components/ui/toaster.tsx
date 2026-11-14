'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastKind = 'error' | 'success';
interface ToastItem {
    id: number;
    kind: ToastKind;
    message: string;
}

// Tiny module-level store so non-React code (async handlers) can raise toasts.
let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

function emit() {
    listeners.forEach((l) => l(items));
}

function dismiss(id: number) {
    items = items.filter((t) => t.id !== id);
    emit();
}

function push(kind: ToastKind, message: string) {
    const id = nextId++;
    items = [...items.slice(-2), { id, kind, message }]; // keep at most 3
    emit();
    setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500);
}

export const toast = {
    error: (message: string) => push('error', message),
    success: (message: string) => push('success', message),
};

export function Toaster() {
    const [list, setList] = useState<ToastItem[]>([]);

    useEffect(() => {
        listeners.add(setList);
        return () => {
            listeners.delete(setList);
        };
    }, []);

    if (list.length === 0) return null;

    return (
        <div
            className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex flex-col items-center gap-2 px-4 md:bottom-6"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {list.map((t) => (
                <div
                    key={t.id}
                    role={t.kind === 'error' ? 'alert' : 'status'}
                    className={cn(
                        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-background p-3 text-sm shadow-lg',
                        'animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none',
                        t.kind === 'error' ? 'border-destructive/40' : 'border-border'
                    )}
                >
                    {t.kind === 'error' ? (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                    ) : (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                    )}
                    <p className="min-w-0 flex-1 break-words">{t.message}</p>
                    <button
                        type="button"
                        onClick={() => dismiss(t.id)}
                        className="-m-1 shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
