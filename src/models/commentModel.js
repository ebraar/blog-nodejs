const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    likes: {
        type: Number,
        default: 0
    }
}, { collection: "comments", timestamps: true });

// Sanal alan (virtual) ekleme
CommentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment'
});

// Sanal alanların JSON'da gösterilmesini sağlama
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

// İndeksler
CommentSchema.index({ post: 1 }); // Post üzerinde indeks
CommentSchema.index({ author: 1 }); // Yazar üzerinde indeks
CommentSchema.index({ parentComment: 1 }); // ParentComment üzerinde indeks

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;