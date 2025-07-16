import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhwhbmgnbboovudkovfs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZod2hibWduYmJvb3Z1ZGtvdmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Nzg2NzgsImV4cCI6MjA2ODI1NDY3OH0.XG7VTSHSZX-as6TP6Hr79VFyYo9MXjm5w1b9tpf0duY';

console.log('SUPABASE URL:', supabaseUrl);
console.log('SUPABASE KEY:', supabaseAnonKey);

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);