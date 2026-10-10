/* PUBLIC values only; never a service-role key.
 * Before enabling: owner approves RU-based Auth/database/storage/backups and applicable processing terms.
 * Use an authorized self-hosted Supabase deployment in that region; no foreign cloud is selected here.
 * Run backend/account-schema.sql in its database; enable email confirmation + SMTP.
 * Configure Site URL and exact redirects for this storefront, including ?auth=recovery#/account.
 * Match backend mail-config.php auth_url/auth_public_key; enable auth_region_confirmed there.
 * Verify registration/confirmation/login/reset, two-user RLS and protected order history before launch.
 * Reference: https://supabase.com/docs/guides/self-hosting */
window.PT_AUTH_CONFIG=Object.freeze({url:'',publishableKey:'',regionApproved:false});
