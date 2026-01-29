'use client';

import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrackerGroup } from '@/components/dashboard/TrackerGroup';
import { TrackerForm } from '@/components/dashboard/TrackerForm';
import { EventCard } from '@/components/dashboard/EventCard';
import { EventForm } from '@/components/dashboard/EventForm';
import { useTrackers, useCreateTracker, useDeleteTracker } from '@/hooks/useTrackers';
import { useEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { Tracker, Event as EventType, TrackerFormData, EventFormData } from '@/lib/types';

import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/milestones');
}
