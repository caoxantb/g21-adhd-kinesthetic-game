export const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode).json({
    msg: err.message,
  });

  next(err);
};
