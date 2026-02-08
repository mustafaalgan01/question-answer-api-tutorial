
const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const { sendJwtToClint } = require("../helpers/authorization/tokenHelpers");
const { validedUserInput, comparePassword } = require("../helpers/input/inputHelpers");
const sendEmail = require("../helpers/libraries/sendEmail");

const register = asyncErrorWrapper(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendJwtToClint(user, res);


});

const login = asyncErrorWrapper(async (req, res, next) => {

    const { email, password } = req.body;

    if (!validedUserInput(email, password)) {
        return next(new CustomError("Please Check your inouts", 400));
    }

    const user = await User.findOne({ email }).select("+password");;

    if (!comparePassword(password, user.password)) {
        return next(new CustomError("Please check your credentials", 400));
    }

    sendJwtToClint(user, res);


});

const logout = asyncErrorWrapper(async (req, res, next) => {


    const { NODE_ENV } = process.env;

    return res
        .status(200)
        .clearCookie("access_token", {
            httpOnly: true,
            expires: new Date(Date.now()),
            secure: NODE_ENV === "development" ? false : true
        })
        .json({
            success: true,
            data: {
                success: true,
                message: "Logout Successfull"
            }
        });
});

const forgotpassword = asyncErrorWrapper(async (req, res, next) => {
    const resetEmail = req.body.email;
    const user = await User.findOne({ email: resetEmail });
    if (!user) {
        return next(new CustomError("There is no user with that email", 400));
    }
    const resetPasswordToken = user.getResetPasswordTokenFromUser();

    await user.save();

    const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken${resetPasswordToken}`;
    const emailTemplate = `
    <h3>Reset Your Password</h3>
    <p>This 
        <a href='${resetPasswordUrl}' 
            target = '_blank'>link
        </a>
            Will expire in 1 hour
    </p>
    `;

    try {
        await sendEmail({
            from: process.env.SMTP_USER,
            to: resetEmail,
            subject: "Reset Your Password",
            html: emailTemplate
        });

        res.status(200).json({
            success: true,
            message: "Token Send The Your Email"
        });
    }


    catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        return next(new CustomError("Email Cloud Not Be Sent", 500));
    }

});

const resetPassword = asyncErrorWrapper(async (req, res, next) => {
    const { resetPasswordToken } = req.query;
    const { password } = req.body;

    if (!resetPasswordToken) {
        return next(new CustomError("Please Provide a Valid Token", 400));
    }
    let user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });


    if (!user) {
        return next(CustomError("Invalide Token or Session Expired", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;


    await user.save();

    return res.status(200).json({
        success: true,
        message: "Reset Password Process Successfull"
    });
});

const getUser = (req, res, next) => {
    res.json({
        succes: true,
        data: {
            id: req.user.id,
            name: req.user.name
        }
    });
};
const editDetails = asyncErrorWrapper(async (req, res, next) => {
    const editInformation = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, editInformation, {
        new: true,
        runValidators: true
    });
    return res.status(200).
        json({
            success: true,
            data: user
        });
});

const imageUpload = asyncErrorWrapper(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        "profile_image": req.savedProfileImage
    }, {
        new: true,
        runValidators: true
    })

    res.status(200)
        .json({
            success: true,
            message: "Image Upload Successfull",
            data: user
        })
});
module.exports = { register, login, logout, forgotpassword, resetPassword, editDetails, imageUpload, getUser };