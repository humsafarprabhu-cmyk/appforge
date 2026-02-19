import { createClient } from './client';

const supabase = createClient();

// ---- Apps ----

export async function getUserApps() {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getApp(id: string) {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createApp(app: {
  name: string;
  description?: string;
  category?: string;
  color_primary?: string;
  color_secondary?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const slug = app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('apps')
    .insert({
      user_id: user.id,
      name: app.name,
      slug,
      description: app.description || '',
      category: app.category || 'custom',
      package_name: `com.appforge.${slug}`,
      color_primary: app.color_primary || '#6366f1',
      color_secondary: app.color_secondary || '#8b5cf6',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApp(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('apps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApp(id: string) {
  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ---- Chat Messages ----

export async function getAppMessages(appId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('app_id', appId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addMessage(message: {
  app_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  version_number?: number;
  tokens_used?: number;
  model?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ ...message, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---- Usage ----

export async function getTodayUsage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { prompts_used: 0, tokens_used: 0 };

  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  return data || { prompts_used: 0, tokens_used: 0 };
}

export async function incrementUsage(promptTokens: number = 0) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  
  // Upsert usage record
  try {
    await supabase.rpc('increment_usage', {
      p_user_id: user.id,
      p_date: today,
      p_prompts: 1,
      p_tokens: promptTokens,
    });
  } catch {
    // Fallback: direct upsert
    await supabase.from('usage').upsert({
      user_id: user.id,
      date: today,
      prompts_used: 1,
      tokens_used: promptTokens,
    }, { onConflict: 'user_id,date' });
  }
}

// ---- Profile ----

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}
