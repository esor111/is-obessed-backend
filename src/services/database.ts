import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Topic, Subtopic, GlobalSetting } from '../types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Global Settings operations
  async getGlobalSetting(key: string): Promise<GlobalSetting | null> {
    const { data, error } = await this.supabase
      .from('global_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to get global setting: ${error.message}`);
    }

    return data;
  }

  async updateGlobalSetting(key: string, value: number): Promise<GlobalSetting> {
    const { data, error } = await this.supabase
      .from('global_settings')
      .upsert({ key, value })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update global setting: ${error.message}`);
    }

    return data;
  }

  // Topic operations
  async getAllTopics(): Promise<Topic[]> {
    const { data, error } = await this.supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get topics: ${error.message}`);
    }

    return data || [];
  }

  async getTopicById(id: string): Promise<Topic | null> {
    const { data, error } = await this.supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get topic: ${error.message}`);
    }

    return data;
  }

  async createTopic(topic: Omit<Topic, 'id' | 'created_at' | 'updated_at' | 'earnings' | 'completion_percentage'>): Promise<Topic> {
    const { data, error } = await this.supabase
      .from('topics')
      .insert({
        ...topic,
        earnings: 0,
        completion_percentage: 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create topic: ${error.message}`);
    }

    return data;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    const { data, error } = await this.supabase
      .from('topics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update topic: ${error.message}`);
    }

    return data;
  }

  // Subtopic operations
  async getSubtopicsByTopicId(topicId: string): Promise<Subtopic[]> {
    const { data, error } = await this.supabase
      .from('subtopics')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get subtopics: ${error.message}`);
    }

    return data || [];
  }

  async getSubtopicById(id: string): Promise<Subtopic | null> {
    const { data, error } = await this.supabase
      .from('subtopics')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get subtopic: ${error.message}`);
    }

    return data;
  }

  async createSubtopic(subtopic: Omit<Subtopic, 'id' | 'created_at' | 'updated_at'>): Promise<Subtopic> {
    const { data, error } = await this.supabase
      .from('subtopics')
      .insert({
        ...subtopic,
        reps_completed: 0,
        reps_goal: 18 // Always default to 18
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subtopic: ${error.message}`);
    }

    return data;
  }

  async updateSubtopic(id: string, updates: Partial<Subtopic>): Promise<Subtopic> {
    const { data, error } = await this.supabase
      .from('subtopics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subtopic: ${error.message}`);
    }

    return data;
  }

  async deleteSubtopic(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('subtopics')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete subtopic: ${error.message}`);
    }
  }

  // Get unique categories
  async getUniqueCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('topics')
      .select('category')
      .order('category');

    if (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }

    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories.sort();
  }
}

export const db = new DatabaseService();
export default DatabaseService;