/* Public configuration only. Never put a service-role key or SMTP password here.
   1. Create/choose the authorized Supabase project; run backend/account-schema.sql.
   2. Enable email confirmation and production SMTP in Supabase Auth.
   3. Site URL: https://matras0v.github.io/pravilnye-tehnologii/
      Allowed redirects: https://matras0v.github.io/pravilnye-tehnologii/**
   4. Set project URL and sb_publishable_... key below. Keep email confirmation enabled.
   5. Verify signup, confirmation, login, reset and RLS with two separate customers.
   Reference: https://supabase.com/docs/guides/auth/passwords */
window.PT_AUTH_CONFIG = Object.freeze({url:'',publishableKey:''});
