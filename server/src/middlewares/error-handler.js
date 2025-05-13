const ErrorHandler = (err, req, res, next) => {
    console.log("Middleware Error Hadnling");
    const errStatus = err.status || 500;
    const errName = err.name || 'Something went wrong';
    const errMsg = err.message || 'Something went wrong';
    const errParams = err.params;
    return res.status(errStatus).json({
        success: false,
        status: errStatus,
        name: errName,
        message: errMsg,
        params: errParams,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
}

module.exports = ErrorHandler;