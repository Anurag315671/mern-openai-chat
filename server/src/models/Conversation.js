import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 12000 },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 80, default: 'New chat' },
  messages: { type: [messageSchema], default: [] },
}, { timestamps: true });

conversationSchema.index({ updatedAt: -1 });
export default mongoose.model('Conversation', conversationSchema);
