const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const getSingleUser = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    return res.status(200)
        .json({
            succes: true,
            data: user
        })
});

const getAllUsers = asyncErrorWrapper(async (req, res, next) => {


    const user = await User.find();

    return res.status(200)
        .json({
            succes: true,
            data: user
        })
});


module.exports = { getSingleUser, getAllUsers };
