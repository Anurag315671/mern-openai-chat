import { Router } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import { openai } from '../services/openai.js';
import { config } from '../config.js';

const router = Router();
const MAX_HISTORY = 40;
const MAX_MESSAGE_LENGTH = 12000;
const isValidId = (id) => mongoose.isValidObjectId(id);

function titleFromMessage(message) {
  const compact = message.replace(/\s+/g, ' ').trim();
  return compact.length > 48 ? `${compact.slice(0, 47).trimEnd()}…` : compact || 'New chat';
}

router.get('/', async (req, res, next) => {
  try {
    const conversations = await Conversation.aggregate([
      { $project: {
        title: 1,
        updatedAt: 1,
        createdAt: 1,
        messageCount: { $size: { $ifNull: ['$messages', []] } },
      } },
      { $sort: { updatedAt: -1 } },
      { $limit: 100 },
    ]);
    res.json({ conversations });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const conversation = await Conversation.create({ title: 'New chat', messages: [] });
    res.status(201).json({ conversation });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid conversation id.' });
    const conversation = await Conversation.findById(req.params.id).lean();
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
    res.json({ conversation });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid conversation id.' });
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.post('/:id/messages', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid conversation id.' });
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content) return res.status(400).json({ error: 'Message cannot be empty.' });
    if (content.length > MAX_MESSAGE_LENGTH) {
      return res.status(413).json({ error: `Message must be ${MAX_MESSAGE_LENGTH.toLocaleString()} characters or fewer.` });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

    try {
      const pendingHistory = [...conversation.messages, { role: 'user', content }];
      const input = pendingHistory.slice(-MAX_HISTORY).map(({ role, content: text }) => ({ role, content: text }));
      const response = await openai.responses.create({
        model: config.openAiModel,
        instructions: 'You are a helpful, clear, and friendly AI assistant. Use Markdown when it improves readability.',
        input,
        max_output_tokens: 1600,
        store: false,
      });

      const reply = response.output_text?.trim();
      if (!reply) {
        const emptyError = new Error('The AI returned an empty response. Please try again.');
        emptyError.statusCode = 502;
        throw emptyError;
      }

      conversation.messages.push({ role: 'user', content });
      if (conversation.messages.length === 1) conversation.title = titleFromMessage(content);
      conversation.messages.push({ role: 'assistant', content: reply });
      await conversation.save();
      res.json({ conversation, assistantMessage: conversation.messages[conversation.messages.length - 1] });
    } catch (providerError) {
      console.error('OpenAI request failed:', providerError);
      const error = new Error(providerError.statusCode === 502
        ? providerError.message
        : 'Could not get a reply from OpenAI. Check your API key, model access, and server logs, then try again.');
      error.statusCode = providerError.statusCode || 502;
      throw error;
    }
  } catch (error) { next(error); }
});

export default router;
