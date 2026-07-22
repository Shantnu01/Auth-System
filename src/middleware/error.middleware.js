const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: err.errors[0].message,
            statusCode:400
        });
    }

    const statusCode = err.statusCode || 500;

    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message:message,
        statusCode:statusCode
    });
};
module.exports = errorHandler;