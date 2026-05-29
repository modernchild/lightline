// ─────────────────────────────────────────────
// services/supabase.js
// Supabase client initialization
// ─────────────────────────────────────────────

const { createClient } = require('@supabase/supabase-js');

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set — Supabase disabled.');
}

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
    },
  }
);

// For server-side operations, use service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
  {
    db: {
      schema: 'public',
    },
  }
);

module.exports = { supabase, supabaseAdmin };
