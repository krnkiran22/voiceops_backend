import mongoose, { Schema, Document } from 'mongoose';

export interface ILinkCode extends Document {
    userId: mongoose.Types.ObjectId;
    code: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LinkCodeSchema = new Schema<ILinkCode>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-delete expired documents
LinkCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.LinkCode || mongoose.model<ILinkCode>('LinkCode', LinkCodeSchema);
