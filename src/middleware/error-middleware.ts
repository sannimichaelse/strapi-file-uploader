
import { NextFunction, Request, Response } from 'express';
import { LoggerUtil } from '../util/logger';
import { CodeUtil } from '../util/response-codes';

/**
 * Error response middleware for 404 not found.
 *
 * @param {Object} req
 * @param {Object} res
 */
export function notFound(req: Request, res: Response): any {
  const methodName = 'notFound | ';
  LoggerUtil.error(methodName, 'Error | Ooops, route not found', `originalUrl | ${ req.originalUrl }`);
  res.status(CodeUtil.HTTP_STATUS_CODE_NOT_FOUND).json({
    code: CodeUtil.HTTP_STATUS_CODE_NOT_FOUND,
    message: 'Ooops, route not found',
    status: 'error',
    data: null,
  });
}

/**
 * Error response middleware for handling all app errors except generic errors.
 *
 * @param  {Object}   err
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
// eslint-disable-next-line no-unused-vars
export function appErrorHandler(err: any, req: Request, res: Response, next: NextFunction): any {
  if (err.code && typeof err.code === 'number') {
    if (process.env.NODE_ENV !== 'test') {
      LoggerUtil.error(`
        status - ${err.code}
        message - ${err.message}
        url - ${req.originalUrl}
        method - ${req.method}
        IP - ${req.ip}
      `);
    } else {
      LoggerUtil.error(`${err.message}`);
    }
    res.status(err.code).json({
      code: err.code,
      message: err.message,
    });
  } else {
    next(err);
  }
}

/**
 * Generic error response middleware for internal server errors.
 *
 * @param  {Object}   err
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
// eslint-disable-next-line no-unused-vars
export function genericErrorHandler(err, req, res, next): any {
  if (process.env.NODE_ENV !== 'test') {
    LoggerUtil.error(`
    status - ${CodeUtil.HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR}
    message - ${err.stack}
    url - ${req.originalUrl}
    method - ${req.method}
    IP - ${req.ip}
  `);
  } else {
    LoggerUtil.error(`${err.stack}`);
  }

  res.status(CodeUtil.HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR).json({
    code: CodeUtil.HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR,
    data: null,
    message: err.message,
  });
}
