const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jsonwt = require("jsonwebtoken");
const key = require("../../setup/dbconfig");
const multer = require("multer");
const path = require('path');
const cookieParser = require('cookie-parser');

const Person = require("../../models/Person");
const UploadedMedia = require("../../models/UploadedMedia");

//@type   GET
//@route   /api/media/
//@desc   To show all video files
//@access   PRIVATE

router.get('/', passport.authenticate("jwt", { session: false }), (req, res) => {
    UploadedMedia.find({ email: req.user.email }, { url: 1 })
        .then(mediafiles => {
            if (!mediafiles) {
                return res.json({
                    success: false,
                    mediafiles: "No media files are available!"
                });
            }
            return res.json({
                success: true,
                mediafiles: mediafiles
            });
        })
        .catch(err => console.log("got some error in showing video files " + err));
});

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../../public/myuploads'))
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage,

}).single('media');

//@type   POST
//@route   /api/media/upload
//@desc   To upload media
//@access   PRIVATE

router.post('/upload', passport.authenticate("jwt", { session: false }), (req, res) => {
    var email = req.user.email;
    // var medianame = req.body.medianame;
    // var description = req.body.description;
    upload(req, res, (error) => {
        if (error) {
            res.json({
                message: error
            })
        } else {
            const videofile = {};
            if (email) videofile.email = email;
            // videofile.medianame = "demovideo";
            // if (description) videofile.description = description;
            videofile.url = 'myuploads/' + req.file.filename;
            new UploadedMedia(videofile)
                .save()
                .then(success => {
                    res.json({
                        message: 'successfully uploaded....',
                        filename: 'myuploads/' + req.file.filename
                    })
                })
                .catch(err => console.log(err));
        }
    })
});

module.exports = router;