const express = require('express');
const router = express.Router();
const { tokenCheck } = require("../middlewares/auth");
const blogController = require('../controllers/postController');
const commentController = require('../controllers/postController');

router.get('/posts/search', blogController.searchPosts); // Blog yazılarını arama ve filtreleme
router.post('/posts/create', tokenCheck, blogController.createBlog); // Blog yazısı oluşturma
router.put('/posts/update/:_id', tokenCheck, blogController.updateBlog); // Blog yazısı güncelleme
router.delete('/posts/delete/:_id', tokenCheck, blogController.deleteBlog); // Blog yazısı silme
router.get('/posts', blogController.getAllBlogs); // Tüm blog yazılarını listeleme
router.get('/posts/:_id', blogController.getBlogById); // Tek bir blog yazısını getirme
router.post('/posts/:postId/comments', tokenCheck, commentController.createComment); // Yorum oluşturma
router.put('/comments/:_id', tokenCheck, commentController.updateComment); // Yorum güncelleme
router.delete('/comments/:_id', tokenCheck, commentController.deleteComment); // Yorum silme
router.get('/comments/post/:post', tokenCheck, commentController.getCommentsByPostId); // Bir postun yorumlarını getirme
router.put('/comments/:id/like', tokenCheck, commentController.likeComment); // Yorum beğenme
router.put('/posts/:id/like', tokenCheck, blogController.likePost); // Blog yazısını beğenme

module.exports = router;
