const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require("../config/database");

module.exports = function(router){

    router.post('/register', function(req, res){

        req.body.email
        req.body.username
        req.body.password
        if (!req.body.email) {
            res.json({ success: false, message: "You must provide an Email"})
        }
        else if (!req.body.username) {
            res.json({ success: false, message: "You must provide an Username"})
        }
        else if (!req.body.password) {
            res.json({ success: false, message: "You must provide an Password"})
        }
        else {
            
            var user = new User({
                email: req.body.email.toLowerCase(),
                username: req.body.username.toLowerCase(),
                password: req.body.password
            });
            user.save(function(err){
                if (err) {
                // Check if error is an error indicating duplicate account
                    if (err.code === 11000) {
                        res.json({ success: false, message: 'Username or Email already exists' }); // Return error
                    } else {
                        // Check if error is a validation rror
                        if (err.errors) {
                        // Check if validation error is in the email field
                        if (err.errors.email) {
                            res.json({ success: false, message: err.errors.email.message }); // Return error
                        } else {
                            // Check if validation error is in the username field
                            if (err.errors.username) {
                            res.json({ success: false, message: err.errors.username.message }); // Return error
                            } else {
                            // Check if validation error is in the password field
                            if (err.errors.password) {
                                res.json({ success: false, message: err.errors.password.message }); // Return error
                            } else {
                                res.json({ success: false, message: err }); // Return any other error not already covered
                            }
                            }
                        }
                        } else {
                        res.json({ success: false, message: 'Could not save user. Error: ', err }); // Return error if not related to validation
                        }
                    }
                } else {
                res.json({ success: true, message: 'Account registered!' }); // Return success
                }
            });

            

        }

    });

    router.post('/login', function(req, res){
        if (!req.body.username) {
            res.json({ success: false, message: "No Username was Provided"})
        } else {
            if (!req.body.password) {
                res.json({ success: false, message: "No Password was Provided"})
            } else {
                User.findOne({ username: req.body.username.toLowerCase() }, function(err, user){
                    if (err) {
                        res.json({ success: false, message: err})
                    } else {
                        if (!user) {
                            res.json({ success: false, message: "Username not found."})
                        } else {

                            const ValidPassword = user.comparePassword(req.body.password);
                            if (!ValidPassword) {
                                res.json({ success: false, message: "Password is Incorrect"})
                            } else {
                                
                               const token = jwt.sign({
                                    userId: user._id
                                }, config.secret, { expiresIn: '24h' });

                                res.json({ success: true, message: "Logging In", token: token, user: { username: user.username }})


                            }

                        }
                    }
                });
            }
        }
    });

    router.get('/checkEmail/:email', function(req, res){
        if (!req.params.email) {

            res.json({ success: false, message: 'Email not Provided' });
        } else {

            User.findOne({ email: req.params.email}, function(err, user){

                if (err) {

                    res.json({ success: false, message: err });

                } else {

                    if (user) {
                        res.json({ success: false, message: 'Email is Already Taken' });
                    } else {
                        res.json({ success: true, message: 'Email is Available' });
                    }

                }
                
            })

        }

    });

    router.get('/checkUsername/:username', function(req, res){
        if (!req.params.username) {

            res.json({ success: false, message: 'Username not Provided' });

        } else {

            User.findOne({ username: req.params.username}, function(err, user){

                if (err) {

                    res.json({ success: false, message: err });

                } else {

                    if (user) {
                        res.json({ success: false, message: 'Username is Already Taken' });
                    } else {
                        res.json({ success: true, message: 'Username is Available' });
                    }

                }
                
            })

        }

    });




    router.use(function(req, res, next){
        const token = req.headers['authorization'];
        if (!token) {
            res.json({ success: false, message: 'No Token Provided'})
        } else {
            jwt.verify(token, config.secret, function(err, decoded){
                if (err) {
                    res.json({ success: false, message: 'Token is Invalid: '+err})
                    next(err);
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        }
    });

    router.get('/profile', function(req, res){
        User.findOne({ _id: req.decoded.userId}).select('username email').exec(function(err, user){
            if (err) {
                res.json({ success: false, message: err})
            } else {
                if (!user) {
                    res.json({ success: false, message: 'User not Found'})
                } else {
                    res.json({ success: true, user: user})
                }
            }
        })
    });
        
            

    return router;
}