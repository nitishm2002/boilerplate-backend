import logger from './logger';

export const statusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

type ErrorResponse = {
  status: string;
  message: string;
};

/**
 * Sends an error response.
 *
 * @param data - The data for the error response.
 * @returns The error response.
 */
export function sendErrorResponse(data: { message: string }): ErrorResponse {
  return {
    status: 'error',
    ...data,
  };
}

function parseError(err: Error): string {
  logger.error(err.stack);
  return err.message;
}

/**
 * Get the error message based on the given error.
 * @param err The error object or message.
 * @returns The error message.
 */
export function getErrorMsg(err: unknown): { message: string } {
  if (typeof err === 'string') {
    logger.error(err);
    return { message: err };
  } else {
    return { message: parseError(err as Error) };
  }
}

// export function getErrorStatusCode(err: string | Error) {
export function getErrorStatusCode(err: unknown) {
  if (typeof err === 'string') {
    logger.error(err);
    return statusCode.BAD_REQUEST;
  } else {
    return statusCode.INTERNAL_SERVER_ERROR;
  }
}

interface SuccessResponse {
  status: string;
  message?: string;
  data: unknown;
  // other properties of the data object
}

/**
 * Creates a success response object by merging the provided data with a 'success' status.
 *
 * @param {SuccessResponse} data - The data to be included in the success response.
 * @return {SuccessResponse} - The success response object.
 */
export function sendSuccessResponse({
  message,
  ...data
}: Record<string, unknown>): SuccessResponse {
  return {
    status: 'success',
    ...(message && { message: message as string }),
    data: data as Record<string, unknown>,
  };
}

/**
 * Throws an error and logs it using the logger. The error can be provided as an
 * instance of the Error class or as a string.
 *
 * @param {Error | string} err - The error to throw.
 * @return {void} This function does not return a value.
 */
export function throwError(err: Error | string): void {
  logger.error(err);
  throw err;
}

interface FilePathInfo {
  filepath: string;
  extension: string;
  name: string;
  filename: string;
}

export function extractFilePath(path: string): FilePathInfo {
  const url: string = path;
  const ind1: number = url.lastIndexOf('/');
  return {
    filepath: url.substring(0, ind1 + 1),
    extension: url.substring(url.lastIndexOf('.') + 1, url.length),
    name: url
      .substring(url.lastIndexOf('/') + 1, url.length)
      .split('.')
      .slice(0, -1)
      .join('.'),
    filename: url.substring(url.lastIndexOf('/') + 1, url.length), // dummy_filename.png
  };
}
