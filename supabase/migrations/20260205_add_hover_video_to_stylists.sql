-- Add hover_video_url to stylist_calendars table
ALTER TABLE stylist_calendars ADD COLUMN IF NOT EXISTS hover_video_url TEXT;
