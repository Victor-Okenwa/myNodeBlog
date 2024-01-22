const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controller/profileController');
const multer = require('multer');
const path = require('path');
// console.log(path.parse(('../public/')));
const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'public', 'profiles'),
    filename: function (req, file, cb) {
        cb(undefined, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage
});

router.get('/', authMiddleware.requireAuth, (req, res) => res.render('profile'));
router.get('/:id', profileController.getProfile);
router.post('/', authMiddleware.requireAuth, upload.single('profile'), profileController.profilePost);
router.put('/', authMiddleware.requireAuth, profileController.profilePut);

module.exports = router