const User = require('../model/User');
const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.post('/', (req, res) => {
    const token = req.cookies.jwt;
    jwt.verify(token, process.env.JWT_TOKEN, async (err, decoded) => {
        try {
            if (err) {
                throw Error(err);
            }
            const user = await User.findById(decoded.id);
            user.roles.Editor = true;
            const updatedUser = await user.save();
            console.log(updatedUser);
            res.json({
                success: true
            });
        } catch (err) {
            console.log(err);
        }
    });
})
module.exports = router;