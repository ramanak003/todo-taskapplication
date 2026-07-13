import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymnqustfjfyynjyprpkd.supabase.co').trim();
// Vercel has a poisoned environment variable for NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, so we ignore it completely
// and either use NEXT_PUBLIC_SUPABASE_ANON_KEY or the hardcoded correct sb_publishable key.
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BipApjSTLAd-hXW_Krf2Og_5SqJGKcC';

// Clean the key (remove quotes if they accidentally got in)
const supabaseAnonKey = rawAnonKey.replace(/['"]/g, '').trim();

// Validation and warnings
if (process.env.NODE_ENV === "development") {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
    console.warn(
      'DEBUG: Using fallback Supabase environment variables in DEVELOPMENT. Please set them in your .env.local file.'
    )
  } else {
    console.log('DEBUG: Supabase client initialized with URL:', supabaseUrl);
    if (rawAnonKey.includes('"') || rawAnonKey.includes("'")) {
      console.warn('DEBUG: Detected quotes in Supabase Key. They have been automatically removed.');
    }
  }
} else if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
    console.warn(
      'INFO: Using fallback Supabase environment variables in PRODUCTION. This is unusual and may cause issues.'
    )
  }
}

// --- Mock Supabase Client for Local Storage Fallback ---
class MockSupabaseClient {
  private getStorageKey(table: string) {
    return `quicktask_mock_${table}`;
  }

  private getData(table: string): any[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.getStorageKey(table));
    return data ? JSON.parse(data) : [];
  }

  private setData(table: string, data: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    // Trigger a storage event for same-tab updates if needed, though simple state management usually handles this
    window.dispatchEvent(new Event('storage'));
  }

  auth = {
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signOut: async () => ({ error: null })
  };

  from(table: string) {
    return {
      select: (columns: string = '*', { count, head }: { count?: string, head?: boolean } = {}) => {
        const data = this.getData(table);
        const chainable = {
          order: (column: string, { ascending = true } = {}) => {
            const sortedData = [...data].sort((a, b) => {
              const valA = a[column];
              const valB = b[column];
              if (valA < valB) return ascending ? -1 : 1;
              if (valA > valB) return ascending ? 1 : -1;
              return 0;
            });
            // Update data for next chain
            data.splice(0, data.length, ...sortedData)
            return chainable;
          },
          eq: (column: string, value: any) => {
            const filteredData = data.filter(item => item[column] === value);
            data.splice(0, data.length, ...filteredData);
            return chainable;
          },
          limit: (n: number) => {
            data.splice(n);
            return chainable;
          },
          then: (fn: any) => {
            if (head) return Promise.resolve(fn({ count: data.length, data: null, error: null }));
            return Promise.resolve(fn({ data, error: null }));
          },
          single: () => Promise.resolve({ data: data[0] || null, error: null }),
        };
        return chainable;
      },
      insert: (values: any[]) => {
        const data = this.getData(table);
        const newItems = values.map(v => ({
          ...v,
          id: v.id || Math.random().toString(36).substring(2, 11),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        this.setData(table, [...newItems, ...data]);
        return {
          select: () => ({
            single: () => Promise.resolve({ data: newItems[0], error: null }),
          }),
        };
      },
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => {
            const data = this.getData(table);
            let updatedItem: any = null;
            const newData = data.map(item => {
              if (item[column] === value) {
                updatedItem = { ...item, ...updates, updated_at: new Date().toISOString() };
                return updatedItem;
              }
              return item;
            });
            this.setData(table, newData);
            return {
              select: () => ({
                single: () => Promise.resolve({ data: updatedItem, error: null }),
              }),
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            const data = this.getData(table);
            const newData = data.filter(item => item[column] !== value);
            this.setData(table, newData);
            return {
              select: () => Promise.resolve({ data: null, error: null }),
              then: (fn: any) => Promise.resolve(fn({ data: [], error: null })),
            };
          },
          neq: (column: string, value: any) => {
            // Mock delete all
            this.setData(table, []);
            return Promise.resolve({ error: null });
          }
        };
      },
    };
  }

  channel() {
    return {
      on: () => ({ subscribe: () => ({}) }),
    };
  }

  removeChannel() { }
}

const realSupabase = createClient(supabaseUrl, supabaseAnonKey)
const mockSupabase = new MockSupabaseClient()

const isLocalMode = typeof window !== 'undefined' && window.localStorage.getItem('supabase_fallback_active') === 'true';

// Export the correct client statically to avoid Proxy context loss
export const supabase: any = isLocalMode ? mockSupabase : realSupabase;

// Helper to switch to fallback
export const useLocalFallback = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('supabase_fallback_active', 'true');
    window.location.reload();
  }
}

// Helper to switch back to real Supabase
export const useRealSupabase = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('supabase_fallback_active');
    window.location.reload();
  }
}
