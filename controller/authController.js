const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const handleErrors = (err) => {
    const errors = {
        username: '',
        email: '',
        password: ''
    }

    if (err.code == 11000) {
        errors.email = 'That email already exists';
        return errors;
    }

    if (err.message.toLowerCase().includes('user validation failed')) {
        Object.values(err.errors).map(error => {
            errors[error.properties.path] = error.properties.message;
        })
    }

    // For login
    if (err.message.toLowerCase() == 'email required') {
        errors.email = 'email cannot be empty';
    }

    if (err.message.toLowerCase() == 'incorrect email') {
        errors.email = 'email not found';
    }

    if (err.message.toLowerCase() == 'password required') {
        errors.password = 'password cannot be empty';
    }

    if (err.message.toLowerCase() == 'incorrect password') {
        errors.password = 'password is incorrect';
    }
    return errors;
}
const maxAge = 60 * 60 * 24 * 1;
const createToken = (id) => {
    return jwt.sign({
        id
    }, process.env.JWT_TOKEN, {
        expiresIn: maxAge
    });
}

const signup = async (req, res) => {
    try {
        let {
            username,
            email,
            password
        } = await req.body;

        password = await bcrypt.hash(password, 12);

        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            const token = createToken(user._id);
            res.cookie('jwt', token, {
                maxAge: maxAge * 1000,
                httpOnly: true,
            });
            res.json({
                user: user._id
            });
        }
    } catch (err) {
        const errors = handleErrors(err);
        console.log(err);
        res.json({
            errors
        })
    }
}

const login = async (req, res) => {
    const {
        email,
        password
    } = req.body;
    try {
        const user = await User.login(email, password);
        if (user) {
            console.log(user)
            const token = await createToken(user._id);
            res.cookie('jwt', token, {
                maxAge: maxAge * 1000,
                httpOnly: true
            });
            res.json({
                user: user._id
            });
        }
    } catch (err) {
        const errors = handleErrors(err);
        res.json({
            errors
        });
        console.log(errors, err.message);
    }
}

const logout = (req, res) => {
    res.cookie('jwt', '', {
        maxAge: .1
    });
    res.redirect('/');
}

module.exports = {
    signup,
    login,
    logout
}