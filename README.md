# Wobbly Soccer

A physics soccer game in a single HTML file. Open `wobbly-soccer.html` in a browser to play.

## Online multiplayer

Online rooms run on [Supabase Realtime](https://supabase.com/docs/guides/realtime) (broadcast and presence) over private channels, with anonymous Supabase Auth so messages come from a verified sender. A small `rooms` table and RLS policies are required: apply `supabase/migrations/` first (see [`supabase/README.md`](supabase/README.md)).

1. Create a free Supabase project.
2. Copy the project URL and the anon (public) key from **Project Settings → API**.
3. Either paste them into the constants at the top of the online section of `wobbly-soccer.html` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), or leave those empty and type them into the Play Online screen, which saves them in that browser.
4. Click **Play Online → Create room**, share the 4-letter code, and your friends click **Join**.

How it works: the player who creates the room is the host and runs the match. Everyone else sends their key presses to the host and sees the host's game streamed back about 20 times a second. Rooms support 1v1 or 2v2 (empty seats are filled with bots), and anyone past the seat limit watches. Online controls are W / ↑ to jump, A D / ← → to lean, and S / ↓ to dig.

Joiners draw their own player slightly ahead of the host's snapshots (visual prediction only; add `?nopredict` to turn it off).

To try rooms without Supabase, open the page with `?nettest` on the URL (served over http, for example `python3 -m http.server`) in two tabs of the same browser.
