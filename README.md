# Table Control — Nightclub Reservations Starter

This is a mobile-friendly, Arabic RTL prototype for managing 50 nightclub tables.

## Run it
- Open `index.html` in a modern browser, or publish the folder with GitHub Pages.
- The prototype saves bookings in that browser's local storage.

## Important limitation
This starter is **not yet a shared live system**. Local storage means each phone has its own data. Before using it for real bookings, connect a shared backend (for example Supabase), add staff authentication and roles, implement database-level protection against double-booking, and test on multiple phones.

## Next implementation steps
1. Confirm the real table numbering and floor layout.
2. Create a Supabase project and database tables for `tables`, `reservations`, and `staff`.
3. Add authentication and access policies so only authorized staff can see/edit reservations.
4. Add realtime updates and a database constraint/transaction strategy to prevent concurrent conflicting reservations.
5. Test backup, cancellation, reservation duration, and staff audit history before going live.
