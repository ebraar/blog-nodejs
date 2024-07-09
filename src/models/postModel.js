const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }]
},{ collection: "blog_posts", timestamps: true });

// İndeksler
PostSchema.index({ title: 'text' }); // Başlık üzerinde tam metin indeksi
PostSchema.index({ author: 1 }); // Yazar üzerinde indeks
PostSchema.index({ tags: 1 }); // Etiketler üzerinde indeks
PostSchema.index({ views: -1 }); // Görüntülenme sayısı üzerinde indeks (azalan sırada)

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;


