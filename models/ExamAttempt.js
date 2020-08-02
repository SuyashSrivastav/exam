const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var examAttemptSchema = new Schema({

    
    user_id: Schema.Types.ObjectId,
    exam_id: Schema.Types.ObjectId,
    start_time: Date,
    status: {
        type: String,
        enum: ['Started', 'Finished'],
        default: 'Started'
    },
    marks_obtained: Number,
    total_marks: Number,

    correct_answer_array: Array,
    created_at: Date

});

module.exports = mongoose.model("ExamAttempt", examAttemptSchema);