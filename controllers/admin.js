const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const blockUser = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    user.blocked = !user.blocked;

    await user.save();

    return res.status(200).
        json({
            success: true,
            message: "Blocked - Unblock Successfull"
        });
});


const deleteUser = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return next(new CustomError("User not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});
module.exports = { blockUser, deleteUser };