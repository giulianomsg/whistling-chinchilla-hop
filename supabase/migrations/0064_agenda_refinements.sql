
-- Migration: Add rejection_reason to scheduled_workouts
-- Description: Adds a nullable text column to store the reason when a workout schedule is rejected

ALTER TABLE public.scheduled_workouts
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
