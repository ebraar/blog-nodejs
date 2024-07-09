const multer = require('multer');
const path = require('path');
const fs = require('fs');

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png", "image/gif"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(new Error("Bu resim tipi desteklenmemektedir. Lütfen farklı bir resim seçiniz!"), false);
    } else {
        cb(null, true);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const rootDir = path.dirname(require.main.filename);
        const uploadPath = path.join(rootDir, '/public/uploads');
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const extension = file.mimetype.split("/")[1];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `image_${uniqueSuffix}.${extension}`;
        
        if (!req.savedImages) req.savedImages = [];
        req.savedImages.push(filename);
        
        cb(null, filename);
    }
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
