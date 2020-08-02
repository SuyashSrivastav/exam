const User = require("../models/User")

const get = async (where, limit) => new Promise((resolve, reject) => {
    limit = limit || 10;
    where = where || {};
    User.find(where)
        .limit(limit)
        .exec((err, doc) => (err ? reject(err) : resolve(doc)));
});

const getCount = async (where) => {
    new Promise((resolve, reject) => {
        where = where || {};
        User.countDocuments(where)
            .exec((err, doc) => (err ? reject(err) : resolve(doc)));
    });
}

const update = async (where, acObj) => new Promise((resolve, reject) => {

    User.where(where).updateOne(acObj, (err, count) =>
        err ? reject(err) : resolve(count)
    );
});


const create = async (acObj) => new Promise((resolve, reject) => {
    var user = new User(acObj);
    user
        .save()
        .then(User => resolve(User))
        .catch(e => reject(e));
});


module.exports = {
    get,
    create,
    update,
    getCount
}