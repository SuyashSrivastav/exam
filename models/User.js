const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var userSchema = new Schema({

    name: String,
    email: String,
    is_email_verified: {
        type: Boolean,
        default: false
    },
    exams_attempted: Array,
    address: String,
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: Date

});

module.exports = mongoose.model("User", userSchema);