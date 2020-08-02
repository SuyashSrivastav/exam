const ExamAttempt = require("../models/ExamAttempt")

const get = async (where, limit) => new Promise((resolve, reject) => {
    limit = limit || 10;
    where = where || {};
    ExamAttempt.find(where)
        .limit(limit)
        .exec((err, doc) => (err ? reject(err) : resolve(doc)));
});

const getFinishedExams = async (where) =>
    new Promise((resolve, reject) => {

        let current_time = new Date()
        where = where || {};
        ExamAttempt.aggregate([
            { $match: where },
            {
                $lookup: {
                    from: 'exams',
                    localField: 'exam_id',
                    foreignField: '_id',
                    as: 'exam'
                }
            },
            { $unwind: '$exam' },
            {
                $project: {
                    ready_to_finish: {
                        $cond: [
                            { $gte: [current_time, { $add: ['$start_time', { $multiply: ['$exam.duration_in_mins', 60000] }] }] },
                            true, false
                        ]
                    }
                }
            },
            {
                $redact: {
                    $cond: {
                        if: '$ready_to_finish',
                        then: "$$KEEP",
                        else: "$$PRUNE"
                    }
                }
            }
        ])
            .exec((err, doc) => (err ? reject(err) : resolve(doc)));
    });

const getCount = async (where) => {
    new Promise((resolve, reject) => {
        where = where || {};
        ExamAttempt.countDocuments(where)
            .exec((err, doc) => (err ? reject(err) : resolve(doc)));
    });
}

const update = async (where, acObj) => new Promise((resolve, reject) => {

    ExamAttempt.where(where).updateOne(acObj, (err, count) =>
        err ? reject(err) : resolve(count)
    );
});


const updateIn = async (where, updateObj) => new Promise((resolve, reject) => {
    ExamAttempt.updateOne(where, updateObj, { upsert: true })
        .exec((err, doc) => (err ? reject(err) : resolve(doc)));
});


const create = async (acObj) => new Promise((resolve, reject) => {
    var examAttempt = new ExamAttempt(acObj);
    examAttempt
        .save()
        .then(ExamAttempt => resolve(ExamAttempt))
        .catch(e => reject(e));
});


const getExamQuestions = async (where) =>
    new Promise((resolve, reject) => {

        let current_time = new Date()
        where = where || {};

        ExamAttempt.aggregate([
            { $match: where },
            { $sort: { start_time: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'exams',
                    localField: 'exam_id',
                    foreignField: '_id',
                    as: 'exam'
                }
            },
            { $unwind: '$exam' },
            {
                $project: {
                    name: { $arrayElemAt: ['$user.name', 0] },
                    status: '$status',
                    exam_name: '$exam.exam_name',
                    subject: '$exam.subject',
                    duration: '$exam.duration_in_mins',
                    time_left: {
                        $cond: [{ $gte: [current_time, { $add: ['$start_time', { $multiply: ['$exam.duration_in_mins', 60000] }] }] },
                            0, {
                            $divide: [
                                { $subtract: [{ $add: ['$start_time', { $multiply: ['$exam.duration_in_mins', 60000] }] }, current_time] }, 60000]
                        }]
                    },
                    questions_array: '$exam.questions_array',
                }
            },
            { $unwind: '$questions_array' },
            { $sort: { 'questions_array.serial_number': 1 } },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    exam_name: { $first: '$exam_name' },
                    subject: { $first: '$subject' },
                    status: { $first: '$status' },
                    duration: { $first: '$duration' },
                    total_marks: { $sum: '$questions_array.marks' },
                    time_left: { $first: '$time_left' },
                    questions_array: { $push: { serial_number: '$questions_array.serial_number', question: '$questions_array.question', marks: '$questions_array.marks' } }
                }
            }
        ])
            .exec((err, doc) => (err ? reject(err) : resolve(doc)));
    });


const getExamAnswers = async (where) =>
    new Promise((resolve, reject) => {

        let current_time = new Date()
        where = where || {};

        ExamAttempt.aggregate([
            { $match: where },
            { $sort: { start_time: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'exams',
                    localField: 'exam_id',
                    foreignField: '_id',
                    as: 'exam'
                }
            },
            { $unwind: '$exam' },
            {
                $project: {
                    name: { $arrayElemAt: ['$user.name', 0] },
                    status: '$status',
                    exam_name: '$exam.exam_name',
                    subject: '$exam.subject',
                    duration: '$exam.duration_in_mins',
                    time_left: {
                        $cond: [{ $gte: [current_time, { $add: ['$start_time', { $multiply: ['$exam.duration_in_mins', 60000] }] }] },
                            0, {
                            $divide: [
                                { $subtract: [{ $add: ['$start_time', { $multiply: ['$exam.duration_in_mins', 60000] }] }, current_time] }, 60000]
                        }]
                    },
                    total_marks: { $sum: { $map: { input: '$exam.questions_array', as: 'question', in: '$$question.marks' } } },
                    questions_array: '$exam.questions_array',
                    marks_obtained: 1,
                    correct_answers: 1,
                    incorrect_answers: 1,
                    result_status: 1
                }
            }
        ])
            .exec((err, doc) => (err ? reject(err) : resolve(doc)));
    });


module.exports = {
    get,
    create,
    update,
    updateIn,
    getCount,
    getFinishedExams,
    getExamQuestions,
    getExamAnswers
}