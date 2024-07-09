const express = require('express');
const router = express.Router();
const upload = require('../multer/multerConfig').single('profilePicture');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

const auth = require('./authRouter');
const user = require('./userRouter');
const posts = require('./postRouter'); 
const comments = require('./postRouter');

router.use(auth); 
router.use(user); 
router.use(posts); 
router.use(comments);

router.post("/upload", upload, (req, res) => {
  if (req.file) {
    return res.status(200).json({ success: true, images: req.savedImages });
  } else {
    return res.status(400).json({ error: "Resim Yüklenirken Hata Çıktı" });
  }
});

router.put('/users/updateProfile', upload, async (req, res) => {
  try {
    const { _id, bio } = req.body;

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    let profilePicture;
    if (req.file) {
      profilePicture = `/public/uploads/${req.file.filename}`;
      
      // eski profil resmini sil
      if (user.profilePicture) {
        const oldImagePath = path.join(path.dirname(require.main.filename), user.profilePicture);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Eski profil resmi silinirken hata:', err);
          } else {
            console.log('Eski profil resmi başarıyla silindi:', user.profilePicture);
          }
        });
      }
    }

    const updatedData = {
      bio: bio,
      profilePicture: profilePicture || user.profilePicture // Yeni resim yoksa eskiyi kullan
    };

    const updatedUser = await User.findByIdAndUpdate(_id, updatedData, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Bir hata meydana geldi', error: error.message });
  }
});

module.exports = router;
