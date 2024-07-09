
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const User = require('../models/userModel');

const createBlog = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const author = req.user._id; // auth middleware'i tarafından sağlanır

        const newBlog = new Post({ title, content, tags, author });
        await newBlog.save();

        return res.status(201).json(newBlog);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { _id } = req.params;
        const { title, content, tags } = req.body;

        const updatedBlog = await Post.findByIdAndUpdate(_id, { title, content, tags, updatedAt: Date.now() }, { new: true });

        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
        }

        return res.json(updatedBlog);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const { _id } = req.params;

        const deletedBlog = await Post.findByIdAndDelete(_id);

        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
        }

        return res.json({ message: 'Blog yazısı başarıyla silindi' });
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Post.find().populate('author', 'name email');
        return res.json(blogs);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const getBlogById = async (req, res) => {
    try {
        const { _id } = req.params;
        const blog = await Post.findByIdAndUpdate(_id, { $inc: { views: 1 } }, { new: true }).populate('author', 'name email');

        if (!blog) {
            return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
        }

        return res.json(blog);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};


const createComment = async (req, res) => {
    try {
        const { content, parentCommentId } = req.body;
        const { postId } = req.params;
        const author = req.user._id;

        const newComment = new Comment({
            content,
            author,
            post: postId,
            parentComment: parentCommentId || null
        });

        await newComment.save();

        return res.status(201).json(newComment);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const updateComment = async (req, res) => {
    try {
        const { _id } = req.params;
        const { content } = req.body;

        const updatedComment = await Comment.findByIdAndUpdate(_id, { content, updatedAt: Date.now() }, { new: true });

        if (!updatedComment) {
            return res.status(404).json({ message: 'Yorum bulunamadı' });
        }

        return res.json(updatedComment);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { _id } = req.params;

        const deletedComment = await Comment.findByIdAndDelete(_id);

        if (!deletedComment) {
            return res.status(404).json({ message: 'Yorum bulunamadı' });
        }

        return res.json({ message: 'Yorum başarıyla silindi' });
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const getCommentsByPostId = async (req, res) => {
    try {
        const { post } = req.params;
        const comments = await Comment.find({ post: post, parentComment: null }).populate('author', 'name email').populate({
            path: 'replies',
            populate: {
                path: 'author',
                select: 'name email'
            }
        });

        return res.json(comments);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const likeComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({ message: 'Yorum bulunamadı' });
        }

        // Beğeniyi artır
        comment.likes += 1;

        await comment.save();

        return res.json(comment);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};


const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
        }

        // Kullanıcı beğenmiş mi kontrol et
        let updateOperation;
        if (post.likes.includes(userId)) {
            // Kullanıcı beğenmişse, beğeniyi kaldır
            updateOperation = { $pull: { likes: userId } };
        } else {
            // Kullanıcı beğenmemişse, beğeni ekle
            updateOperation = { $addToSet: { likes: userId } };
        }

        const updatedPost = await Post.findByIdAndUpdate(id, updateOperation, { new: true }).populate('author', 'name email');

        return res.json(updatedPost);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};

const searchPosts = async (req, res) => {
    try {
        const { title, author, startDate, endDate, tags, sortBy } = req.query;
        let query = {};

        // Başlık arama
        if (title) {
            query.title = { $regex: title, $options: 'i' }; // Başlıkta arama ve büyük/küçük harf duyarlılığı
        }

        // Tarih aralığı filtreleme
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Etiketler filtreleme
        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        // Sıralama
        let sortOption = {};
        if (sortBy) {
            if (sortBy === 'popularity') {
                sortOption.views = -1; // Görüntülenme sayısına göre azalan sırada
            } else if (sortBy === 'newest') {
                sortOption.createdAt = -1; // En yeniye göre azalan sırada
            } else if (sortBy === 'oldest') {
                sortOption.createdAt = 1; // En eskiye göre artan sırada
            }
        }

        let posts;

        // Author adı ile arama
        if (author) {
            const users = await User.find({ name: { $regex: author, $options: 'i' } });
            const userIds = users.map(user => user._id);
            query.author = { $in: userIds };
            posts = await Post.find(query).populate('author', 'name email').sort(sortOption);
        } else {
            posts = await Post.find(query).populate('author', 'name email').sort(sortOption);
        }

        return res.json(posts);
    } catch (error) {
        return res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
    }
};



module.exports = {
    createBlog,
    updateBlog,
    deleteBlog,
    getAllBlogs,
    getBlogById,
    createComment,
    updateComment,
    deleteComment,
    getCommentsByPostId,
    likeComment,
    likePost,
    searchPosts
};
