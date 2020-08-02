const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require("mongoose");
const baseController = require("./BaseController");
const userService = require("../services/UserService")

const signUp = async (req, res, next) => {

    let errMsg = "error";
    let errCode = 404;
    let name = req.body.name
    let email = req.body.email ? req.body.email : ""
    let address = req.body.address ? req.body.address : ""

    if (name && name.trim() != "") {

        let userData = await userService.get({ name: name }).catch(e => next(e))
        if (userData && userData.length > 0) {
            errMsg = "username_exists"
            res.send(baseController.generateResponse(errCode, errMsg));
        }
        else {
            //new user
            console.log("new user");

            let userObj = {
                name: name,
                email: email,
                address: address,
                created_at: new Date()
            }

            let created = await userService.create(userObj).catch(e => next(e));

            if (created && JSON.stringify(created) !== '{}') {

                errMsg = "success";
                errCode = 0;
                res.send(baseController.generateResponse(errCode, errMsg, {
                    user_id: created.id
                }));
            }
            else {
                res.send(baseController.generateResponse(errCode, errMsg));
            }
        }
    }
    else {
        res.send(baseController.generateResponse(errCode, errMsg));
    }
}

const signIn = async (req, res, next) => {

    let errMsg = "not-found";
    let errCode = 404;

    let name = req.body.name

    let userData = await userService.get({ name: name }).catch(e => next(e))
    if (userData && userData.length > 0) {

        errMsg = "success";
        errCode = 0;
        res.send(baseController.generateResponse(errCode, errMsg, {
            user_id: userData[0]._id
        }));
    }
    else {
        res.send(baseController.generateResponse(errCode, errMsg));
    }

}


const editUserInfo = async (req, res, next) => {

    let errMsg = "error";
    let errCode = 404;

    let userId = req.user_data.id

    let newEmail = req.body.new_email
    let newAddress = req.body.new_address
    let newName = req.body.new_name


    let userData = await userService.get({ _id: userId }).catch(e => next(e))
    if (userData && userData.length > 0) {

        let update = await userService.update({ _id: userData[0]._id }, {
            $set: {
                name: newName ? newName : userData[0].name,
                address: newAddress ? newAddress : userData[0].address,
                email: newEmail ? newEmail : userData[0].email
            }
        }).catch(e => next(e))

        if (update && update.nModified == 1) {
            errMsg = "success";
            errCode = 0;
            res.send(baseController.generateResponse(errCode, errMsg));
        }
        else {
            errMsg = "no-changes";
            res.send(baseController.generateResponse(errCode, errMsg));
        }
    }
    else {
        res.send(baseController.generateResponse(errCode, errMsg));
    }
}



module.exports = {
    signIn,
    signUp,
    editUserInfo
}