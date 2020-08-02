const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require("mongoose");
const ExamService = require('../services/ExamService');
const examAttemptService = require('../services/ExamattemptService');


var connected = false;
var doingJob = false;
var url = 'mongodb://127.0.0.1/exam';



async function connectDB() {

    if (!connected) {
        try {
            mongoose.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        } catch (error) {
            console.log(error);
        }
        var db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error:"));
        db.once("open", function () {
            connected = true;
            console.log("DurationCheckProcessAvailable!");
        });
    }
}

setInterval(() => {
    if (!doingJob) {
        connectDB();
        // console.log("Initiate update ticket at ", new Date());
        checkExamDuration();
    }
}, 30 * 100);


async function checkExamDuration() {
    let errMsg = "no-exam";
    doingJob = true;
    let startedExamData = await examAttemptService.getFinishedExams({ status: "Started" })
    if (startedExamData && startedExamData.length > 0) {
        for (var i in startedExamData) {
            await examAttemptService.update({ _id: startedExamData[i]._id }, { $set: { status: 'Finished' } })
        }
    }
    else {
        doingJob = false;
        //console.log(errMsg);
        return errMsg;
    }
    doingJob = false;
    errMsg = "success";
    return errMsg;
}   