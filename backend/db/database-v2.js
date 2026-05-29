// ─────────────────────────────────────────────
// db/database-v2.js (Supabase)
// Conversation and generation storage
// ─────────────────────────────────────────────

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../services/supabase');

const DatabaseV2 = {
  /**
   * Create a conversation
   */
  async createConversation(userId, feature, title = 'New conversation') {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        id: uuidv4(),
        user_id: userId,
        feature,
        title: title.slice(0, 120),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Conversation Create Error]', error);
      throw new Error('Failed to create conversation.');
    }

    return {
      id: data.id,
      userId: data.user_id,
      feature: data.feature,
      title: data.title,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Get conversation by ID (with auth check)
   */
  async getConversation(id, userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select()
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      feature: data.feature,
      title: data.title,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * List conversations for a user
   */
  async listConversations(userId, feature = null) {
    let query = supabase
      .from('conversations')
      .select()
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (feature) query = query.eq('feature', feature);

    const { data, error } = await query;

    if (error) {
      console.error('[Conversation List Error]', error);
      return [];
    }

    return data.map(c => ({
      id: c.id,
      userId: c.user_id,
      feature: c.feature,
      title: c.title,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  },

  /**
   * Delete conversation and its messages
   */
  async deleteConversation(id, userId) {
    // Verify ownership
    const { data } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    // Delete messages first (cascade)
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', id);

    // Delete conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  },

  /**
   * Add message to conversation
   */
  async addMessage(conversationId, role, content) {
    const { error } = await supabase.from('messages').insert({
      id: uuidv4(),
      conversation_id: conversationId,
      role,
      content,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Message Insert Error]', error);
      throw new Error('Failed to save message.');
    }

    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  },

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId, limit = 12) {
    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[History Error]', error);
      return [];
    }

    return data;
  },

  /**
   * Delete all messages in conversation
   */
  async deleteConversationMessages(conversationId, userId) {
    // Verify ownership
    const { data } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    return !error;
  },

  /**
   * Save generation record
   */
  async saveGeneration(record) {
    const gen = {
      id: uuidv4(),
      user_id: record.userId,
      feature: record.feature,
      title: (record.title || record.feature).slice(0, 120),
      input: record.input || {},
      content: record.content,
      model: record.model,
      rag_used: !!record.ragUsed,
      fallback_used: !!record.fallbackUsed,
      stream_used: !!record.streamUsed,
      conversation_id: record.conversationId || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('generations')
      .insert(gen)
      .select()
      .single();

    if (error) {
      console.error('[Generation Save Error]', error);
      throw new Error('Failed to save generation.');
    }

    return data;
  },

  /**
   * List generations for a user
   */
  async listGenerations(userId, opts = {}) {
    const { feature, limit = 50 } = opts;

    let query = supabase
      .from('generations')
      .select('id, feature, title, model, rag_used, created_at, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (feature) query = query.eq('feature', feature);

    const { data, error } = await query;

    if (error) {
      console.error('[Generation List Error]', error);
      return [];
    }

    return data.map(g => ({
      id: g.id,
      feature: g.feature,
      title: g.title,
      model: g.model,
      ragUsed: g.rag_used,
      createdAt: g.created_at,
      preview: (g.content || '').slice(0, 200),
    }));
  },

  /**
   * Get generation with evaluation
   */
  async getGeneration(id, userId) {
    const { data: gen, error: genError } = await supabase
      .from('generations')
      .select()
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (genError || !gen) return null;

    const { data: evaluation } = await supabase
      .from('evaluations')
      .select()
      .eq('generation_id', id)
      .single();

    return {
      ...gen,
      evaluation: evaluation || null,
    };
  },

  /**
   * Delete generation
   */
  async deleteGeneration(id, userId) {
    // Verify ownership
    const { data } = await supabase
      .from('generations')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    // Delete evaluation first
    await supabase.from('evaluations').delete().eq('generation_id', id);

    // Delete generation
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  },

  /**
   * Delete all user history
   */
  async deleteAllUserHistory(userId) {
    // Get all conversation IDs
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId);

    const convIds = conversations?.map(c => c.id) || [];

    // Get all generation IDs
    const { data: generations } = await supabase
      .from('generations')
      .select('id')
      .eq('user_id', userId);

    const genIds = generations?.map(g => g.id) || [];

    // Delete messages
    if (convIds.length > 0) {
      await supabase
        .from('messages')
        .delete()
        .in('conversation_id', convIds);
    }

    // Delete evaluations
    if (genIds.length > 0) {
      await supabase
        .from('evaluations')
        .delete()
        .in('generation_id', genIds);
    }

    // Delete conversations
    await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    // Delete generations
    await supabase
      .from('generations')
      .delete()
      .eq('user_id', userId);

    return true;
  },

  /**
   * Save evaluation
   */
  async saveEvaluation(data) {
    const { error } = await supabase.from('evaluations').upsert(
      {
        id: data.id || uuidv4(),
        generation_id: data.generationId,
        overall_score: data.scores.overall,
        relevance_score: data.scores.relevance,
        clarity_score: data.scores.clarity,
        accuracy_score: data.scores.accuracy,
        feedback: data.feedback,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'generation_id' }
    );

    if (error) {
      console.error('[Evaluation Save Error]', error);
      throw new Error('Failed to save evaluation.');
    }
  },

  /**
   * Initialize database (no-op for Supabase)
   */
  async initDatabase() {
    console.log('✅ Supabase database connected');
  },
};

module.exports = DatabaseV2;
