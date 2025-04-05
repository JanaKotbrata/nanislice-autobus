class GetResponseHandler {
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
class PostResponseHandler {
    constructor(expressApp, route, handler) {
        expressApp.post(route, async (req, res, next) => {
            try {
                const result = await this[handler](req, res);
                res.status(200).json(result)
            } catch (e) {
                next(e);
            }
        })
    }
}


module.exports = {GetResponseHandler, PostResponseHandler};