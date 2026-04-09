const Question = require("../models/Question");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const Answer = require("../models/Answer");


// const addNewAnswerToQuestion = asyncErrorWrapper(async (req, res, next) => {
//     console.log(req.params);
//     const { question_id } = req.params;
//     const user_id = req.user.id;
//     const information = req.body;
//     const answer = await Answer.create({
//         ...information,
//         question: question_id,
//         user: user_id,

//     });
//     return res.status(200)
//         .json({
//             success: true,
//             data: answer
//         });
// });



const addNewAnswerToQuestion = asyncErrorWrapper(async (req, res, next) => {



    const { question_id } = req.params;
    const user_id = req.user.id;
    const { content } = req.body;

    const question = await Question.findById(question_id);


    if (!content) {
        return next(new CustomError("Content is required", 400));
    }


    if (!req.user) {
        return next(new CustomError("User not authorized", 401));
    }



    if (!question) {
        return next(new CustomError("Question not found", 404));
    }

    try {
        const answer = await Answer.create({
            ...req.body,
            question: question_id,
            user: user_id
        });

        res.status(201).json({
            success: true,
            data: answer
        });

    } catch (err) {
        console.error("ERROR:", err);
        next(err);
    }
});




const getAllAnswerByQuestion = asyncErrorWrapper(async (req, res, next) => {

    const { question_id } = req.params;

    const question = await Question.findById(question_id);

    if (!question) {
        return next(new CustomError("Question not found", 404));
    }

    const answers = await Answer.find({ question: question_id });

    res.status(200).json({
        success: true,
        count: answers.length,
        data: answers
    });
});

module.exports = { addNewAnswerToQuestion, getAllAnswerByQuestion };