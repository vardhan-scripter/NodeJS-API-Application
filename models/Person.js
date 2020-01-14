const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    profilePic: {
        type: String,
        default: "http://learncodeonline.in/manicon.png"
    },
    date: {
        type: Date,
        default: Date.now()
    },
    code: {
        type: Number,
        default: null
    }
});

module.exports = Person = mongoose.model("myperson", personSchema);