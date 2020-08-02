const ObjectId = require('mongoose').Types.ObjectId;
const baseController = require("./BaseController");

const examService = require("../services/ExamService")
const examAttemptService = require("../services/ExamattemptService")

const startExam = async (req, res, next) => {

    let errMsg = "error";
    let errCode = 404;

    let examId = req.body.exam_id
    let userId = req.body.user_id

    let examData = await examService.getExamAndUser({ _id: ObjectId(examId) }, ObjectId(userId)).catch(e => next(e))

    if (examData && examData.length > 0 && examData[0].user && examData[0].user.length > 0 && examData[0].examattempts.length == 0
        && examData[0].questions_array && examData[0].questions_array.length > 0) {

        let examcreated = await examAttemptService.create({
            user_id: userId,
            exam_id: examId,
            start_time: new Date(),
            created_at: new Date()

        }).catch(e => next(e))

        if (examcreated && JSON.stringify(examcreated) != '{}') {

            errMsg = "exam-started!!!";
            errCode = 0;
            res.send(baseController.generateResponse(errCode, errMsg, {
                exam_started: {
                    user_name: examData[0].user[0].name,
                    exam_name: examData[0].exam_name,
                    subject: examData[0].subject,
                    start_time: examcreated.start_time.toString(),
                    total_questions: examData[0].questions_array.length,
                    total_marks: examData[0].total_marks,
                    duration: examData[0].duration_in_mins + " minutes",
                    questions: examData[0].questions_array
                }
            }));
        }
        else {
            res.send(baseController.generateResponse(errCode, errMsg));
        }
    }
    else {
        errMsg = "not-available"
        res.send(baseController.generateResponse(errCode, errMsg));
    }
}


const getExamQuestions = async (req, res, next) => {

    let errMsg = "not-found";
    let errCode = 404;

    let examId = req.body.exam_id
    let userId = req.body.user_id

    let examData = await examAttemptService.getExamQuestions({ exam_id: ObjectId(examId), user_id: ObjectId(userId), status: 'Started' }).catch(e => next(e))

    if (examData && examData.length > 0) {

        errMsg = "success";
        errCode = 0;
        examData[0].time_left = parseInt(examData[0].time_left) + " minutes"
        res.send(baseController.generateResponse(errCode, errMsg, { exam: examData[0] }));
    }
    else {
        res.send(baseController.generateResponse(errCode, errMsg));
    }
}

//const answerQuestions = async()
const submitAnswers = async (req, res, next) => {

    let errMsg = "error";
    let errCode = 404;

    let examId = req.body.exam_id
    let userId = req.body.user_id
    let answerObject = req.body.answer_object ? req.body.answer_object : {}

    let examData = await examAttemptService.getExamAnswers({ exam_id: ObjectId(examId), user_id: ObjectId(userId) }).catch(e => next(e))
    if (examData && examData.length > 0 && JSON.stringify(answerObject) != '{}') {

        if (examData[0].result_status && examData[0].result_status == "Completed") {
            errMsg = "success";
            errCode = 0;
            res.send(baseController.generateResponse(errCode, errMsg, {
                user_name: examData[0].name,
                exam_name: examData[0].exam_name,
                subject: examData[0].subject,
                result: {
                    marks_obtained: examData[0].marks_obtained,
                    total_marks: examData[0].total_marks,
                    correct: examData[0].correct_answers,
                    incorrect: examData[0].incorrect_answers
                }
            }));

        }
        else {

            let marks_obtained = 0, correct_answers = 0, incorrect_answers = 0
            for (var i in examData[0].questions_array) {

                let question = examData[0].questions_array[i]
                let answer = question.answers
                if (answerObject[question.serial_number.toString()] && answer[answerObject[question.serial_number.toString()]]
                    && answer[answerObject[question.serial_number.toString()]].is_correct) {
                    marks_obtained += question.marks
                    correct_answers++
                }
                else {
                    marks_obtained -= 1
                    incorrect_answers++
                }

            }

            await examAttemptService.update({ user_id: userId, exam_id: examId }, {
                $set: {
                    marks_obtained: marks_obtained,
                    total_marks: examData[0].total_marks,
                    correct_answers: correct_answers,
                    incorrect_answers: incorrect_answers,
                    finish_date: new Date()
                }
            })


            errMsg = "success";
            errCode = 0;
            res.send(baseController.generateResponse(errCode, errMsg, {
                user_name: examData[0].name,
                exam_name: examData[0].exam_name,
                subject: examData[0].subject,
                result: {
                    marks_obtained: marks_obtained,
                    total_marks: examData[0].total_marks,
                    correct: correct_answers,
                    incorrect: incorrect_answers
                }
            }));

        }
    }
    else {
        res.send(baseController.generateResponse(errCode, errMsg));
    }

}


module.exports = {
    startExam,
    getExamQuestions,
    submitAnswers
}
