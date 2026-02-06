-- Run this SQL in your Supabase SQL Editor to create the table

-- Create valentines table
CREATE TABLE valentines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  sender_name TEXT NOT NULL,
  reply TEXT CHECK (reply IN ('yes', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  replied_at TIMESTAMPTZ
);

-- Create index for fast code lookups
CREATE INDEX idx_valentines_code ON valentines(code);

-- Enable Row Level Security (RLS)
ALTER TABLE valentines ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (create a valentine)
CREATE POLICY "Anyone can create valentines" ON valentines
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read by code
CREATE POLICY "Anyone can read valentines by code" ON valentines
  FOR SELECT USING (true);

-- Allow anyone to update reply (only reply and replied_at fields)
CREATE POLICY "Anyone can update reply" ON valentines
  FOR UPDATE USING (true) WITH CHECK (true);
