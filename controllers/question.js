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



    let query = Question.find();

    const populate = true;
    const populateObject = {
        path: "user",
        select: "name profile_image"
    }
    //Search

    if (req.query.search) {

        const searchObject = {};

        const regex = new RegExp(req.query.search, "i");

        searchObject["title"] = regex;

        query = query.where(searchObject);
    }
    //Populate

    if (populate) {
        query = query.populate(populateObject);
    }


    //Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {};
    const total = await Question.countDocuments();


    if (startIndex > 0) {
        pagination.previous = {
            page: page - 1,
            limit: limit
        }
    }
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit: limit
        }
    }

    //Sort

    const sortKey = req.query.sortBy;

    if (sortKey === "most-answered") {
        query = query.sort("-answerCount -createdAt");
    }
    if (sortKey === "most-liked") {
        query = query.sort("-likeCount -createdAt");
    }
    else {
        query = query.sort("-createdAt");
    }



    query = query.skip(startIndex).limit(limit);


    const questions = await query;
    res
        .status(200)
        .json({
            success: true,
            count: questions.length,
            pagination: pagination,
            data: questions
        });
});

const getSingleQuestion = asyncErrorWrapper(async (req, res, next) => {

    const { id } = req.params;

    const question = await Question.findById(id);

    res
        .status(200)
        .json({
            success: true,
            data: question
        });
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