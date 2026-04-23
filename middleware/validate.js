export default function validate(schema){
  return function (req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next({
        statusCode: 400,
        message: result.error.issues[0].message
      });
    }

    req.validatedData = result.data;

    next();
  };
}