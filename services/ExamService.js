const Exam = require("../models/Exam");
const ObjectId = require('mongoose').Types.ObjectId;

const get = async (where, limit) => new Promise((resolve, reject) => {
    limit = limit || 10;
    where = where || {};
    Exam.find(where)
        .limit(limit)
        .exec((err, doc) => (err ? reject(err) : resolve(doc)));
});


const search = async (where) => new Promise((resolve, reject) => {
    Exam.find(where)
        .exec((err, doc) => (err ? reject(err) : resolve(doc)));
});

const getCount = async (where) => {
    new Promise((resolve, reject) => {
        where = where || {};
        Exam.countDocuments(where)
            .exec((err, doc) => (err ? reject(err) : resolve(doc)));
    });
}

const update = async (where, acObj) => new Promise((resolve, reject) => {

    Exam.where(where).updateOne(acObj, (err, count) =>
        err ? reject(err) : resolve(count)
    );
});


const create = async (acObj) => new Promise((resolve, reject) => {
    var exam = new Exam(acObj);
    exam
        .save()
        .then(Exam => resolve(Exam))
        .catch(e => reject(e));
});

const getExamAndUser = async (where, UserId) => new Promise((resolve, reject) => {

    where = where || {};
    UserId = UserId || null

    Exam.aggregate([
        { $match: where },
        { $unwind: '$questions_array' },
        { $sort: { 'questions_array.serial_number': 1 } },
        {
            $group: {
                _id: '$_id',
                exam_name: { $first: '$exam_name' },
                subject: { $first: '$subject' },
                access_key: { $first: '$access_key' },
                duration_in_mins: { $first: '$duration_in_mins' },
                questions_array: { $push: { serial_number: '$questions_array.serial_number', question: '$questions_array.question', marks: '$questions_array.marks' } },
                total_marks: { $sum: '$questions_array.marks' }
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { user_id: ObjectId(UserId) },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$user_id'] } } }],
                as: 'user'
            }
        },
        {
            $lookup: {
                from: 'examattempts',
                let: { user_id: ObjectId(UserId), exam_id: '$_id' },
                pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$user_id', '$$user_id'] }, { $eq: ['$exam_id', '$$exam_id'] }] } } }],
                as: 'examattempts'
            }
        }

    ])
        .exec((err, doc) => (err ? reject(err) : resolve(doc)));
});


const getExamData = async (where, given_question) => new Promise((resolve, reject) => {
    where = where || {};
    given_question = given_question || ""
    Exam.aggregate([
        { $match: where },
        {
            $project: {
                exam_name: 1,
                subject: 1,
                access_key: 1,
                duration_in_mins: 1,
                questions_array: 1,
                total_marks: { $sum: { $map: { input: '$questions_array', as: 'question', in: '$$question.marks' } } },
                same_question: {
                    $cond: [
                        { $gt: [{ $size: { $filter: { input: '$questions_array', as: 'question', cond: { $eq: ['$$question.question', given_question] } } } }, 0] },
                        true, false
                    ]
                }
            }
        }
    ])
        .exec((err, doc) => (err ? reject(err) : resolve(doc)));
});


module.exports = {
    get,
    search,
    create,
    update,
    getCount,
    getExamAndUser,
    getExamData
}