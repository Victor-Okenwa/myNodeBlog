const jwt = require('jsonwebtoken');
const User = require('../model/User');
const JWT_TOKEN = process.env.JWT_TOKEN;

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, JWT_TOKEN, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.redirect('/login');
            }
            next();
        });
    } else {
        res.redirect('/login');
    }
}

const verifyUser = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
            if (err) {
                res.locals.user = null
                console.log(err)
                next();
            } else {
                const user = await User.findById(decoded.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

const requireEditor = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
                if (err) {
                    res.redirect('/login');
                }
                const user = await User.findById(decoded.id);
                if(user.roles.Editor){
                    next();
                }else{
                    res.redirect('/index');
                }
            });
        } catch (err) {
            console.log(err);
        }
    } else {
        res.redirect('/login');
    }
}

const requireAdmin = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
                if (err) {
                    res.redirect('/login');
                }
                const user = await User.findById(decoded.id);
                if(user.roles.Admin){
                    next();
                }else{
                    res.redirect('/index');
                }
            });
        } catch (err) {
            console.log(err);
        }
    } else {
        res.redirect('/login');
    }
}

module.exports = {
    requireAuth,
    verifyUser,
    requireEditor,
    requireAdmin
};