const asyncErrorWrapper = require("express-async-handler");
const { searchHelper, populateHelper, questionShortHelper, paginationHelper } = require("./queryMiddlewareHelpers");

const questionQueryMiddleware = function (model, options) {

    return asyncErrorWrapper(async function (req, res, next) {
        //Initial Query

        let query = model.find();

        //Search

        query = searchHelper("title", query, req);

        if (options && options.population) {
            query = populateHelper(query, options.population);
        }
        query = questionShortHelper(query, req);


        const total = await model.countDocuments();
        const paginationResault = await paginationHelper(total, query, req);

        query = paginationResault.query;
        const pagination = paginationResault.pagination;

        const queryResault = await query;

        res.queryResault = {
            succes: true,
            count: queryResault.length,
            pagination: pagination,
            data: queryResault
        };
        next();

    });
};
module.exports = questionQueryMiddleware;