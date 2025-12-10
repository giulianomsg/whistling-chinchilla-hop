
-- Migration: Add cancellation_reason to scheduled_workouts
-- Description: Adds cancellation_reason text column to store justification for cancelled appointments.

ALTER TABLE public.scheduled_workouts
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
