var express = require("express");

var router = express.Router();


const userController = require("./controller/UserController")
const examController = require("./controller/ExamController")
const examAttemptController = require("./controller/ExamAttemptController");
const updateExamProcess = require("./processes/CheckExamDuration")

/**User Routes */

router.post("/user/create", userController.signUp)
router.post("/user/get", userController.signIn)

/**Exam Routes */
router.post("/exam/create-initial", examController.createExamInitial)
router.post("/exam/view", examController.getExam)
router.post("/exam/add-question", examController.addExamQuestion)

/**Routes Accessble to User */

router.post("/exam/start", examAttemptController.startExam)
router.post("/exam/get-questions", examAttemptController.getExamQuestions)
router.post("/exam/submit", examAttemptController.submitAnswers)


module.exports = router;