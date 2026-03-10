
import { supabase } from "../src/supabaseClient";
import { User, Scheme, AuthEvent } from "../types";

export const databaseService = {
  /**
   * Log authentication events
   */
  async logAuthEvent(event: AuthEvent) {
    try {
      const { error } = await supabase
        .from('auth_logs')
        .insert({
          ...event,
          created_at: new Date().toISOString()
        });
      if (error) {
        // We log to console but don't throw to avoid breaking the auth flow
        console.error("Error logging auth event:", error);
      }
    } catch (e) {
      console.error("Failed to log auth event:", e);
    }
  },

  /**
   * Upsert user profile data
   */
  async updateProfile(userId: string, profileData: any) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch user profile
   */
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  },

  /**
   * Save a scheme for a user
   */
  async saveScheme(userId: string, scheme: Scheme) {
    const { data, error } = await supabase
      .from('saved_schemes')
      .upsert({
        user_id: userId,
        scheme_id: scheme.id,
        scheme_data: scheme,
        saved_at: new Date().toISOString(),
      }, { onConflict: 'user_id,scheme_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Unsave a scheme
   */
  async unsaveScheme(userId: string, schemeId: string) {
    const { error } = await supabase
      .from('saved_schemes')
      .delete()
      .match({ user_id: userId, scheme_id: schemeId });

    if (error) throw error;
  },

  /**
   * Get all saved schemes for a user
   */
  async getSavedSchemes(userId: string) {
    const { data, error } = await supabase
      .from('saved_schemes')
      .select('scheme_data')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    return data.map(item => item.scheme_data as Scheme);
  },

  /**
   * Check if a scheme is saved
   */
  async isSchemeSaved(userId: string, schemeId: string) {
    const { data, error } = await supabase
      .from('saved_schemes')
      .select('id')
      .match({ user_id: userId, scheme_id: schemeId })
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
};
