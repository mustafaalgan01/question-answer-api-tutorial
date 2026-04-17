const asyncErrorWrapper = require("express-async-handler");
const { searchHelper, paginationHelper } = require("./queryMiddlewareHelpers");

const userQueryMiddleware = function (model, options) {

    return asyncErrorWrapper(async function (req, res, next) {

        let query = model.find();


        //Search by name

        query = searchHelper("name", query, req);


        const total = await model.countDocuments();

        const paginationResault = await paginationHelper(total, query, req);

        query = paginationResault.query;
        pagination = paginationResault.pagination;

        const queryResault = await query.find();

        res.queryResault = {
            succes: true,
            count: queryResault.length,
            pagination: pagination,
            data: queryResault
        };
        next();
    });
};
module.exports = userQueryMiddleware;