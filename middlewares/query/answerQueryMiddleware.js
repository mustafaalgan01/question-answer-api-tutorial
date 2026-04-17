const asyncErrorWrapper = require("express-async-handler");
const { paginationHelper, populateHelper } = require("./queryMiddlewareHelpers");

const answerQueryMiddleware = function (model, options) {

    return asyncErrorWrapper(async function (req, res, next) {

        const { id } = req.params;

        const arrayName = ["answer"];

        const total = (await model.findById(id))["answerCount"];

        const paginationResault = await paginationHelper(total, undefined, req);

        const startIndex = paginationResault.startIndex;
        const limit = paginationResault.limit;

        let queryObject = {};

        queryObject[arrayName] = { $slice: [startIndex, limit] }

        let query = model.find({ _id: id }, queryObject);


        query = populateHelper(query, options.population);
        const queryResault = await query;

        res.queryResault = {
            success: true,
            pagination: paginationResault.pagination,
            data: queryResault
        };

        next();
    });
};
module.exports = answerQueryMiddleware;