const User = require('../model/User');
const jwt = require('jsonwebtoken');
const Post = require('../model/Post');
const dateDifference = require('../middleware/dateDiff');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const handleErrors = (err) => {
    const errors = {
        username: '',
        email: '',
    }

    if (err.code == 11000) {
        errors.email = 'That email already exists';
        return errors;
    }

    if (err.message.toLowerCase().includes('user validation failed')) {
        console.log('User validation err found');
        Object.values(err.errors).map(error => {
            errors[error.properties.path] = error.properties.message;
        });
    }
    return errors;
}

const getProfile = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.params);
        const user = await User.findById(id);
        if (!user) res.locals.user = null;
        res.locals.user = user;
        const postsDb = await Post.find({
            posterID: id
        }).exec();
        if (postsDb) {
            const posts = [];
            for (i = 0; i < postsDb.length; i++) {
                const id = postsDb[i]._id;
                const category = postsDb[i].category;
                const titleObject = postsDb[i].title;
                const title = titleObject.length > 40 ? titleObject.substring(0, 40) + '...' : titleObject;
                const contentObject = postsDb[i].content;
                const content = contentObject.length > 320 ? contentObject.substring(0, 320) + '...' : contentObject;
                const thumbnail = postsDb[i].thumbnail;
                const comments = postsDb[i].comments;
                const likes = postsDb[i].likes;
                const views = postsDb[i].views;
                const postedOn = dateDifference(postsDb[i].postedOn);
                posts.push({
                    id,
                    category,
                    title,
                    content,
                    thumbnail,
                    comments,
                    likes,
                    views,
                    postedOn
                });
            }
            res.locals.posts = posts;
        } else {
            res.locals.posts = null
        }
        res.render('user-profile');
    } catch (error) {
        console.log(error);
    }
}

const profilePost = async (req, res) => {
    try {
        if (req.file) {
            const token = await req.cookies.jwt;
            jwt.verify(token, process.env.JWT_TOKEN, async (err, decoded) => {
                try {
                    if (err) throw new Error('Access blocked, you are not logged in');
                    const user = await User.findById(decoded.id);
                    if (!user) throw new Error('User not found');
                    // fix path undefined error
                    if (user.profile)
                        if (fs.existsSync(path.join(__dirname, '..', 'public', 'profiles', user.profile)))
                            await fsPromises.unlink(path.join(__dirname, '..', 'public', 'profiles', user.profile));

                    user.profile = await req.file.filename;
                    const newProfile = await user.save();
                    if (newProfile) {
                        res.json({
                            success: {
                                filename: newProfile
                            }
                        });
                    }
                } catch (err) {
                    var error = err.message;
                    console.log(err);
                    res.status(400).json({
                        errors: {
                            error
                        }
                    });
                }
            });
        } else {
            throw new Error("Upload failed");
        }
    } catch (err) {
        var error = err.message;
        console.log(err);
        res.status(400).json({
            errors: {
                error
            }
        });
    }
}

const profilePut = (req, res) => {
    const
        username = req.body.username ? req.body.username : '',
        email = req.body.email ? req.body.email : '';

    const token = req.cookies.jwt;
    jwt.verify(token, process.env.JWT_TOKEN, async (err, decoded) => {
        try {
            if (err) throw err;
            const user = await User.findOne({
                _id: decoded.id
            });
            if (!user) {
                return res.json({
                    errors: {
                        email: "Your id was not found"
                    }
                });
            }
            if (username) user.username = await username;
            if (email) user.email = await email;
            const updateUser = await user.save();
            res.json({
                user: updateUser
            });
        } catch (err) {
            const errors = handleErrors(err);
            res.json({
                errors
            });
            console.log(errors);
        }
    });

}

module.exports = {
    getProfile,
    profilePost,
    profilePut
}