export default function successResponse(req, res, next) {
    res.success = (data = null, message = "Success", status = 200, meta = null) => {
        res.status(status).json({
            success: true,
            message,
            data,
            ...(meta && { meta })
        });
    }
    next();
}