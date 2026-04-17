const Question = require("../models/Question");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");




const askNewQuestion = asyncErrorWrapper(async (req, res, next) => {
    const information = req.body;

    const question = await Question.create({
        ...information,
        user: req.user.id
    });

    res
        .status(200)
        .json({
            success: true,
            data: question
        });
});

const getAllQuestion = asyncErrorWrapper(async (req, res, next) => {

    res.status(200).json(res.queryResault);
});

const getSingleQuestion = asyncErrorWrapper(async (req, res, next) => {
    return res
        .status(200)
        .json(res.queryResault);
});

const editQuestion = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { title, content } = req.body;

    let question = await Question.findById(id);

    if (!question) {
        return next(new CustomError("Question not found", 404));
    }

    question.title = title;
    question.content = content;

    question = await question.save();

    res.status(200).json({
        success: true,
        data: question
    });
});

const deleteQuestion = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;

    const delQuestion = await Question.findByIdAndDelete(id);

    if (!delQuestion) {
        return next(new CustomError("Question not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Question Delete Operation Successfull"
    });
});

const likeQuestion = asyncErrorWrapper(async (req, res, next) => {

    const { id } = req.params;

    const question = await Question.findById(id);


    if (question.likes.includes(req.user.id)) {
        return next(new CustomError("You already liked this question", 400));
    }
    question.likes.push(req.user.id);
    question.likeCount = question.likes.length;
    await question.save();

    res.status(200).json({
        success: true,
        data: question
    });
});

const undoLikeQuestion = asyncErrorWrapper(async (req, res, next) => {

    const { id } = req.params;
    const question = await Question.findById(id);


    if (!question.likes.includes(req.user.id)) {
        return next(new CustomError("You already liked this question", 400));
    }
    const index = question.likes.indexOf(req.user.id);

    question.likes.splice(index, 1);
    question.likeCount = question.likes.length;
    await question.save();


    res.status(200).json({
        success: true,
        data: question
    });
});

module.exports = { getAllQuestion, askNewQuestion, getSingleQuestion, editQuestion, deleteQuestion, likeQuestion, undoLikeQuestion };