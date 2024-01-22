const router = require('express').Router();
const authController = require('../controller/authController')

router.get('/signup', (req, res)=>{
    res.render('signup');
});

router.get('/login', (req, res)=>{
    res.render('login');
});
router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

module.exports = router;