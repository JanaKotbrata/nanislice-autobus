const multer = require('multer');
const passport = require("passport");
const upload = multer({ storage: multer.memoryStorage() });

class GetResponseHandler {
    constructor(expressApp, route, handler) {
        expressApp.get(route, passport.authenticate("jwt", {session:false}), async (req, res, next) => {
            try {
                const result = await this[handler](req, res);
                res.status(200).json(result)
            } catch (e) {
                next(e);
            }
        })
    }
}
class NotAuthenticatedGetResponseHandler {
    constructor(expressApp, route, handler) {
        expressApp.get(route, async (req, res, next) => {
            try {
                const result = await this[handler](req, res);
                res.status(200).json(result)
            } catch (e) {
                next(e);
            }
        })
    }
}
class GetFileResponseHandler {
    constructor(expressApp, route, handler) {
        expressApp.get(route, async (req, res, next) => {
            try {
                await this[handler](req, res);
            } catch (e) {
                next(e);
            }
        })
    }
}
class PostResponseHandler {
    constructor(expressApp, route, handler) {
        expressApp.post(route, passport.authenticate("jwt", {session:false}), async (req, res, next) => {
            try {
                const result = await this[handler](req, res);
                res.status(200).json(result)
            } catch (e) {
                next(e);
            }
        })
    }
}
class PostFormDataResponseHandler {
    constructor(expressApp, route, fileInput, handler) {
        expressApp.post(route, passport.authenticate("jwt", {session:false}), upload.single(fileInput), async (req, res, next) => {
            try {
                const result = await this[handler](req, res);
                res.status(200).json(result)
            } catch (e) {
                next(e);
            }
        })
    }
}


module.exports = { GetResponseHandler, PostResponseHandler, GetFileResponseHandler, PostFormDataResponseHandler, NotAuthenticatedGetResponseHandler };