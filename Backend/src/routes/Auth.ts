import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
const router = express.Router()
const User = require('../Schema/User');

router.post('/signup', async (req, res) => {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
        res.json({
            success: false,
            user: null,
            message: "User Already Exists"
        }).status(409)
    }
    if (!existingUser) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const newUser = new User({
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email,
            })

            const createdUser = await newUser.save();
            if (createdUser) {
                res.json({
                    success: true,
                    user: createdUser,
                    message: "User is successfully created"
                }).status(200);
            } else {
                res.json({
                    success: false,
                    user: null,
                    message : "Error while saving the user"
                }).status(500);
            }
        } catch (e) {
            res.json({
                success: false,
                user: null,
                message : "Error while creating the user"
            }).status(500);
        }
    }
})

router.post('/login', passport.authenticate('local', { failureRedirect: '/login/unsuccess' }),
    function (req, res) {
        res.json(req.user).status(200);
    // res.redirect('http://localhost:3000/'); should un-comment when frontend is connected
    }
);

router.get('/login/unsuccess', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Not Authorized',
        user: null
    });
})

router.get('/login/success', (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: 'Authorized',
            user : req.user
        }); 
    }
});

router.get('/logout', (req, res) => {
    req.session = null
    req.cookies = null
    req.logout();
    res.redirect('http://localhost:3000/');
});

module.exports = router