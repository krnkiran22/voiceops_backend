import mongoose, { Schema, Document } from 'mongoose';

export interface IUpdate extends Document {
    userId: mongoose.Types.ObjectId;
    telegramMessageId: string;
    telegramChatId: string;
    mediaType: 'voice' | 'video' | 'text';
    transcript: string;
    summary: string;
    topic: string;
    durationSeconds?: number;
    senderName: string;
    senderTelegramUsername?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UpdateSchema = new Schema<IUpdate>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    telegramMessageId: { type: String, required: true },
    telegramChatId: { type: String, required: true },
    mediaType: { type: String, enum: ['voice', 'video', 'text'], required: true },
    transcript: { type: String, required: true },
    summary: { type: String, required: true },
    topic: { type: String, default: 'update' },
    durationSeconds: { type: Number },
    senderName: { type: String, required: true },
    senderTelegramUsername: { type: String },
}, { timestamps: true });

// Text index for search
UpdateSchema.index({ transcript: 'text', summary: 'text' });

export default mongoose.models.Update || mongoose.model<IUpdate>('Update', UpdateSchema);
