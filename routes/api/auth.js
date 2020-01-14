const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jsonwt = require("jsonwebtoken");
const key = require("../../setup/dbconfig");
const cookieParser = require("cookie-parser");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//@type   POST
//@route   /api/auth/register
//@desc   User registration
//@access   PUBLIC

const Person = require("../../models/Person");


router.post('/register', (req, res) => {
    Person.findOne({ email: req.body.email })
        .then(person => {
            if (person) {
                return res
                    .status(400)
                    .json({ emailerror: "email is already exists" })
            } else {
                const newPerson = new Person({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    })
                    //Encrypt password using bcrypt
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPerson.password, salt, (err, hash) => {
                        if (err) throw err;
                        newPerson.password = hash;
                        newPerson
                            .save()
                            .then(person => res.json({ success: "User registered successfully" }))
                            .catch(err => console.log(err));
                    });
                });
            }
        })
        .catch(err => console.log(err))

});

//@type   POST
//@route   /api/auth/login
//@desc   User Authentication
//@access   PUBLIC

router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    Person.findOne({ email })
        .then(person => {
            if (!person) {
                return res
                    .status(404)
                    .json({ error: "email not exists" })
            }
            bcrypt
                .compare(password, person.password)
                .then(isPerson => {
                    if (isPerson) {
                        const payload = {
                            id: person.id,
                            name: person.name,
                            email: person.email
                        };
                        jsonwt.sign(
                            payload,
                            key.secret, { expiresIn: 3600 },
                            (err, token) => {
                                res.cookie('auth', "Bearer " + token, { maxAge: 360000 });
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });
                            }
                        );
                    } else {
                        return res.json({ error: "password is not correct" })
                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

//@type POST
//@route /api/auth/forgotpassword
//@desc Send OTP to user email to reset password
//@access PUBLIC

router.post("/forgotpassword", (req, res) => {
    const email = req.body.email;
    Person.findOne({ email })
        .then(person => {
            if (!person) {
                return res
                    .status(400)
                    .json({ error: "Email not exists" });
            }
            var uniquecode = Math.floor(1000 + Math.random() * 9000);
            Person.findOneAndUpdate({ email: person.email }, { $set: { code: uniquecode } })
                .then(success => {
                    const msg = {
                        to: success.email,
                        from: 'saivardhanpoloju@gmail.com',
                        subject: 'Password reset Code',
                        text: 'Your are requested to change your password. Here is the code to reset your password',
                        html: '<head><title>Forgot Your Password</title><meta content="text/html; charset=utf-8" http-equiv="Content-Type"><meta content="width=device-width" name="viewport"><style media="screen and (max-width: 680px)">@media screen and (max-width: 680px){.page-center{padding-left:0 !important;padding-right:0 !important}}</style></head><body style="background-color: #f4f4f5;"><table cellpadding="0" cellspacing="0" style="width: 100%; height: 100%; background-color: #f4f4f5; text-align: center;"><tbody><tr><td style="text-align: center;"><table align="center" cellpadding="0" cellspacing="0" id="body" style="background-color: #fff; width: 100%; max-width: 680px; height: 100%;"><tbody><tr><td><table align="center" cellpadding="0" cellspacing="0" class="page-center" style="text-align: left; padding-bottom: 88px; width: 100%; padding-left: 120px; padding-right: 120px;"><tbody><tr><td colspan="2" style="padding-top: 72px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #000000; font-family: sans-serif; font-size: 48px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; mso-line-height-rule: exactly; text-decoration: none;">Forgot your password</td></tr><tr><td style="padding-top: 48px; padding-bottom: 48px;"><table cellpadding="0" cellspacing="0" style="width: 100%"><tbody><tr><td style="width: 100%; height: 1px; max-height: 1px; background-color: #d9dbe0; opacity: 0.81"></td></tr></tbody></table></td></tr><tr><td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;"> Thats okay, it happens! Click on the button below button and enter code to reset your password</td></tr><tr><td colspan="2" style="padding-top: 30px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #000000; font-family: sans-serif; font-size: 40px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; mso-line-height-rule: exactly; text-decoration: none;">' + uniquecode + '</td></tr><tr><td> <a data-click-track-id="37" href="http://localhost:3000/forgotpassword" style="margin-top: 36px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #ffffff; font-family: sans-serif; font-size: 12px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: 0.7px; line-height: 48px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 220px; background-color: #00cc99; border-radius: 28px; display: block; text-align: center; text-transform: uppercase" target="_blank"> Reset Password </a></td></tr></tbody></table></td></tr></tbody></table></body>'
                    };
                    sgMail.send(msg).then(success => {
                        return res.json({ success: "A mail is sended with reset code to your registered email. Please check your mail." });
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

//@type POST
//@route /api/auth/resetpassword
//@desc Reset password
//@access PUBLIC

router.post("/resetpassword", (req, res) => {
    const email = req.body.email;
    const code = req.body.code;
    const password = req.body.password;
    Person.findOne({ email })
        .then(person => {
                if (!person) {
                    return res
                        .status(400)
                        .json({ error: "Email not exists" });
                } else if (person.code != code || code === null) {
                    return res.status(400).json({ error: "Please enter valid code" });
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) throw err;
                            Person.findOneAndUpdate({ email: person.email }, { $set: { code: null } }).findOneAndUpdate({ email: person.email }, { $set: { password: hash } })
                                .then(success => {
                                    return res.json({ status: "Password updated successfully" })
                                }).catch(err => console.log(err));
                        });
                    });
                }
            }

        )
        .catch(err => console.log(err));
});

module.exports = router;