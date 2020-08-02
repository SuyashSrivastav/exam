const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var examSchema = new Schema({

    exam_name: String,
    subject: String,
    total_marks: Number,
    access_key: String,
    duration_in_mins: Number,

    questions_array: [{
        serial_number: Number,
        question: String,
        answers: {
            a: { answer: String, is_correct: Boolean },
            b: { answer: String, is_correct: Boolean },
            c: { answer: String, is_correct: Boolean },
            d: { answer: String, is_correct: Boolean }
        },
        marks: Number,
        is_active: {
            type: Boolean,
            default: true
        }
    }],

    is_available: {
        type: Boolean,
        default: true
    },
    created_at: Date

});

module.exports = mongoose.model("Exam", examSchema);