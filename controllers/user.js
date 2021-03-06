const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');



///////////////////////////////
// SIGNUP
///////////////////////////////
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // Je hash le MDP et le sel 10 fois
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({
                    message: 'Utilisateur créé !'
                }))
                .catch(error => res.status(400).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};

///////////////////////////////
// LOGIN
///////////////////////////////
exports.login = (req, res, next) => {
    User.findOne({ // Je cible et vérifie l'existence de l'utilisateur
            email: req.body.email
        })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    error: 'Utilisateur non trouvé !'
                });
            }
            bcrypt.compare(req.body.password, user.password) // Je compare le MDP entré et celui de la DB
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({
                            error: 'Mot de passe incorrect !'
                        });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ // J'assigne un token à l'utilisateur
                                userId: user._id
                            },
                            process.env.JWT_SECRET_KEY, { // Je cache cette donnée avec le .env
                                expiresIn: '24h'
                            }
                        )
                    });
                })
                .catch(error => res.status(500).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};