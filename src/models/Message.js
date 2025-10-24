import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  threadId: { type: String, index: true },
  fromRole: { type: String, enum: ['user','admin'], required: true },
  userEmail: { type: String, default: '' },
  name: { type: String, default: '' },
  subject: { type: String, default: '' },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  readByAdmin: { type: Boolean, default: false },
  readByUser: { type: Boolean, default: false },
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
