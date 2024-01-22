const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const moment = require('moment');
const bcrypt = require('bcrypt');
const isEmail = require('validator').isEmail;

const userSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        required: [true, 'Username is required']
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, 'email is required'],
        validate: [isEmail, 'email is invalid']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    profile: String,
    roles:{
        User:{
            type: Boolean,
            default: true
        },
        Editor: Boolean,
        Admin: Boolean
    },
    createdOn: {
        type: String,
        default: moment().format('yyyy-MM-DD H:m:s')
    }
});

// userSchema.pre('save', async function (next) {
//     try {
//        if(this.password)  this.password = await bcrypt.hash(this.password, 12);
//        console.log(this)
//     } catch (err) {
//         console.log(err);
//     }
//     next();
// });

userSchema.statics.login = async function (email, password) {
    if (email) {
        const user = await this.findOne({
            email
        });
        if (user) {
            if (password) {
                const auth = await bcrypt.compare(password, user.password);
                if (auth) {
                    return user;
                }
                throw Error('incorrect password');
            }
            throw Error('password required');
        }
        throw Error('incorrect email');
    }
    throw Error('email required')
}

module.exports = mongoose.model('User', userSchema);