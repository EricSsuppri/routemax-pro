/*
# Create route_history table (single-tenant, no auth)

1. New Tables
- `route_history`
  - `id` (uuid, primary key)
  - `payout` (numeric, not null) — total order payout in USD
  - `mileage` (numeric, not null) — total miles driven
  - `gas_price` (numeric, not null) — price per gallon at time of calculation
  - `mpg` (numeric, not null) — vehicle fuel economy
  - `fuel_cost` (numeric, not null) — calculated fuel cost
  - `wear_cost` (numeric, not null) — calculated wear & tear cost
  - `total_cost` (numeric, not null) — fuel + wear
  - `net_profit` (numeric, not null) — payout - total_cost
  - `hours` (numeric, not null) — estimated driving time
  - `hourly_earnings` (numeric, not null) — net profit per hour
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `route_history`.
- Allow anon + authenticated CRUD — this is a single-tenant tool with no sign-in screen.
- All policies use `USING (true)` / `WITH CHECK (true)` because data is intentionally shared.

3. Notes
- No user_id column — app has no auth flow.
- Index on created_at for chronological ordering.
*/

CREATE TABLE IF NOT EXISTS route_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout numeric NOT NULL,
  mileage numeric NOT NULL,
  gas_price numeric NOT NULL,
  mpg numeric NOT NULL,
  fuel_cost numeric NOT NULL,
  wear_cost numeric NOT NULL,
  total_cost numeric NOT NULL,
  net_profit numeric NOT NULL,
  hours numeric NOT NULL,
  hourly_earnings numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_route_history_created_at ON route_history (created_at DESC);

ALTER TABLE route_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_route_history" ON route_history;
CREATE POLICY "anon_select_route_history" ON route_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_route_history" ON route_history;
CREATE POLICY "anon_insert_route_history" ON route_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_route_history" ON route_history;
CREATE POLICY "anon_delete_route_history" ON route_history FOR DELETE
  TO anon, authenticated USING (true);
