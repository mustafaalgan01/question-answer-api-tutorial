const asyncErrorWrapper = require("express-async-handler");

const questionQueryMiddleware = function (model, options) {
    return asyncErrorWrapper(async function (req, res, next) {

        //Initial Query

        let query = model.find();

        //Search

    });
}