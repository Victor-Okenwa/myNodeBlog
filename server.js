const express = require('express');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const port = process.env.PORT;
const dbUri = process.env.DATABASE_URI;
const authMiddleware = require('./middleware/authMiddleware');
const postMiddleware = require('./middleware/postMiddleware');

app.use(cookieParser())
app.use(express.urlencoded({
    extended: false
}));
app.set('view engine', 'ejs');
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '/public')));

app.use('*',  authMiddleware.verifyUser)
app.use('/profile', require('./routes/profile'));
app.use('/addrole', authMiddleware.requireAuth, require('./routes/addRole'));
app.use('/dashboard', authMiddleware.requireAuth, require('./routes/dashboard'));
app.use('/post', require('./routes/post'));
app.use('/comment', require('./routes/comment'));
app.use('/like', require('./routes/like'));
app.use('/', postMiddleware.allPosts, require('./routes/root'));
app.use('/', require('./routes/auth'));

mongoose.connect(dbUri, {})
    .then(result => app.listen(port, console.log(`Server now running on http://localhost:${port}`)))
    .catch(err => console.log(err));