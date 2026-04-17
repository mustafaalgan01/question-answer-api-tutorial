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



const getSingleAnswer = asyncErrorWrapper(async (req, res, next) => {

    const { answer_id } = req.params;

    const answers = await Answer.findById(answer_id)
        .populate({
            path: "question",
            select: "title"
        })
        .populate({
            path: "user",
            select: "name profile_image"
        });

    res.status(200).json({
        success: true,
        data: answers
    });
});




const editAnswer = asyncErrorWrapper(async (req, res, next) => {

    const { answer_id } = req.params;
    const { content } = req.body;
    let answer = await Answer.findById(answer_id);

    answer.content = content;

    await answer.save();

    return res.status(200)
        .json({
            success: true,
            data: answer
        });
});



const deleteAnswer = asyncErrorWrapper(async (req, res, next) => {

    const { answer_id, question_id } = req.params;

    await Answer.findByIdAndDelete(answer_id);

    const question = await Question.findById(question_id);

    if (!question) {
        return next(new CustomError("Question not found", 404));
    }

    question.answers = question.answers.filter(
        (id) => id.toString() !== answer_id
    );
 
    question.answerCount = question.answers.length;

    await question.save();

    return res.status(200).json({
        success: true,
        message: "Answer deleted successfully"
    });

});




const likeAnswer = asyncErrorWrapper(async (req, res, next) => {

    const { answer_id } = req.params;

    const answer = await Answer.findById(answer_id);


    if (answer.likes.includes(req.user.id)) {
        return next(new CustomError("You already liked this answer", 400));
    }

    answer.likes.push(req.user.id);

    await answer.save();

    res.status(200).json({
        success: true,
        data: answer
    });
});

const undoLikeAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;

    const answer = await Answer.findById(answer_id);

    if (!answer.likes.includes(req.user.id)) {
        return next(new CustomError("You can not undo like operation for this answer", 400));
    }

    const index = answer.likes.indexOf(req.user.id);

    answer.likes.splice(index, 1);

    await answer.save();

    res.status(200).json({

        success: true,
        data: answer
    });
});




module.exports = { addNewAnswerToQuestion, getAllAnswerByQuestion, getSingleAnswer, editAnswer, deleteAnswer, likeAnswer, undoLikeAnswer };