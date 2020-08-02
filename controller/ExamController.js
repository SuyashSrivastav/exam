const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require("mongoose");
const baseController = require("./BaseController");

const examService = require("../services/ExamService")


const createExamInitial = async (req, res, next) => {

    let errMsg = "error";
    let errCode = 404;

    let examName = req.body.exam_name ? req.body.exam_name : ""
    let subject = req.body.subject ? req.body.subject : ""
    let accessKey = req.body.access_key ? req.body.access_key : ""
    let durationMins = req.body.duration_in_mins ? req.body.duration_in_mins : 0

    if (examName.trim() != "" && subject.trim() != "" && accessKey.trim() != "" && durationMins) {
        let examcreated = await examService.create({

            exam_name: examName,
            subject: subject,
            access_key: accessKey,
            questions_array: [],
            duration_in_mins: durationMins

        }).catch(e => next(e))

        if (examcreated && JSON.stringify(examcreated) != '{}') {

            errMsg = "success";
            errCode = 0;
            res.send(baseController.generateResponse(errCode, errMsg, {
                exam_id: examcreated._id
            }));
        }
        else {
            res.send(baseController.generateResponse(errCode, errMsg));
        }
    }
    else {
        res.send(baseController.generateResponse(errCode, errMsg));
    }
}


const addExamQuestion = async (req, res, next) => {

    let errMsg = "error";
    let errCode = 404;

    let examId = req.body.exam_id ? req.body.exam_id : null
    let question = req.body.question ? req.body.question : ""
    let answersArray = req.body.answers_array ? req.body.answers_array : []
    let correctAnswer = req.body.correct_answer ? req.body.correct_answer : ""
    let marks = req.body.marks ? req.body.marks : 0

    let examData = await examService.getExamData({ _id: ObjectId(examId) }, question).catch(e => next(e))

    if (examData && examData.length > 0 && question.trim() != "" && answersArray
        && answersArray.length == 4 && answersArray.includes(correctAnswer) && marks && marks > 0 && !examData[0].same_question) {

        let previous_serial_number = examData[0].questions_array ? examData[0].questions_array.length : 0
        let insertquestion = await examService.update({ _id: examId }, {
            $push: {
                questions_array: {
                    serial_number: previous_serial_number + 1,
                    question: question,
                    answers: {
                        a: { answer: answersArray[0], is_correct: (answersArray[0] == correctAnswer) ? true : false },
                        b: { answer: answersArray[1], is_correct: (answersArray[1] == correctAnswer) ? true : false },
                        c: { answer: answersArray[2], is_correct: (answersArray[2] == correctAnswer) ? true : false },
                        d: { answer: answersArray[3], is_correct: (answersArray[3] == correctAnswer) ? true : false },
                    },
                    marks: marks,
                }
            }
        }).catch(e => next(e))


        if (insertquestion && insertquestion.nModified == 1) {
            errMsg = "success";
            errCode = 0;
            res.send(baseController.generateResponse(errCode, errMsg));
        }
        else {
            res.send(baseController.generateResponse(errCode, errMsg));
        }
    }
    else {
        errMsg = "wrong-input";
        res.send(baseController.generateResponse(errCode, errMsg));
    }
}


const getExam = async (req, res, next) => {

    let errMsg = "error";
    let errCode = 404;
    let examId = req.body.exam_id

    let examData = await examService.get({ _id: examId }).catch(e => next(e))
    if (examData && examData.length > 0) {

        errMsg = "success";
        errCode = 0;
        res.send(baseController.generateResponse(errCode, errMsg, { exam: examData[0] }));
    }
    else {
        res.send(baseController.generateResponse(errCode, errMsg));
    }
}

const getAllExams = async (req, res, next) => {

    let errMsg = "error";
    let errCode = 404;

    let examData = await examService.search({ is_available: true }).catch(e => next(e))
    if (examData && examData.length > 0) {

        errMsg = "success";
        errCode = 0;
        res.send(baseController.generateResponse(errCode, errMsg, { exam_list: examData }));
    }
    else {
        res.send(baseController.generateResponse(errCode, errMsg));
    }
}





module.exports = {
    createExamInitial,
    addExamQuestion,
    getAllExams,
    getExam
}