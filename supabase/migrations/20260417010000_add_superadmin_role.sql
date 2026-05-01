-- ============================================================
-- Migration: Add 'superadmin' to app_role enum
-- This MUST be a separate transaction (separate file) so the
-- enum value is committed before it can be referenced.
-- Prerequisites: app_role enum (from migration 20260327151124)
-- Idempotent: ADD VALUE IF NOT EXISTS
-- ============================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';
