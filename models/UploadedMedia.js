const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UploadedMediaSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    medianame: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    url: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
});

module.exports = UploadedMedia = mongoose.model("uploadedmedia", UploadedMediaSchema);