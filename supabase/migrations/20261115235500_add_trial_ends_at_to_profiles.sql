-- No-card 7-day trial: one trial per account.
-- The app grants the trial itself (Google Play trials demand a card), so the
-- trial end date lives on the profile. The app also keeps a device-local copy
-- (localStorage rm_trial_ends_at) as fallback until this column exists.
-- After the trial ends, premium turns off until the user subscribes via Play.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
