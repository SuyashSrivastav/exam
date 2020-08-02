const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var examAttemptSchema = new Schema({

    user_id: Schema.Types.ObjectId,
    exam_id: Schema.Types.ObjectId,
    start_time: Date,
    finish_time: Date,
    marks_obtained: Number,
    total_marks: Number,
    correct_answers: Number,
    incorrect_answers: Number,
    status: {
        type: String,
        enum: ['Started', 'Finished'],
        default: 'Started'
    },
    result_status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    created_at: Date

});

module.exports = mongoose.model("ExamAttempt", examAttemptSchema);