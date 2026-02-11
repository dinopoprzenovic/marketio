/**
 * Shared service types for the Marketio service adapter pattern.
 * All service methods return ServiceResult<T> for consistent error handling.
 */

export interface ServiceResult<T> {
  success: true;
  data: T;
}

export interface ServiceError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ServiceResponse<T> = ServiceResult<T> | ServiceError;

/** Helper to create a successful response */
export function ok<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/** Helper to create an error response */
export function err(code: string, message: string): ServiceError {
  return { success: false, error: { code, message } };
}
