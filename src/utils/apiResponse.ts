/**
 * API Response Standard
 * 
 * Cấu trúc response thống nhất cho tất cả API:
 * {
 *   success: boolean,      // true = thành công, false = thất bại
 *   message: string,       // Thông báo mô tả kết quả
 *   data: any,            // Dữ liệu trả về (có thể là object, array, null)
 *   error?: {             // Chi tiết lỗi (chỉ có khi success = false)
 *     code: string,       // Mã lỗi (VD: 'VALIDATION_ERROR', 'NOT_FOUND', etc.)
 *     details?: any       // Chi tiết lỗi bổ sung
 *   },
 *   meta?: {              // Metadata bổ sung (pagination, etc.)
 *     page?: number,
 *     limit?: number,
 *     total?: number,
 *     totalPages?: number
 *   }
 * }
 */

import { Response } from 'express';

// Error codes enum
export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    CONFLICT = 'CONFLICT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    BAD_REQUEST = 'BAD_REQUEST',
    INVALID_TOKEN = 'INVALID_TOKEN',
    EXPIRED_TOKEN = 'EXPIRED_TOKEN',
}

// Response interfaces
interface ApiResponseSuccess<T = any> {
    success: true;
    message: string;
    data: T;
    meta?: MetaData;
}

interface ApiResponseError {
    success: false;
    message: string;
    data: null;
    error: {
        code: ErrorCode | string;
        details?: any;
    };
}

interface MetaData {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
}

type ApiResponseType<T = any> = ApiResponseSuccess<T> | ApiResponseError;

/**
 * Success Response
 */
export const successResponse = <T = any>(
    res: Response,
    data: T,
    message: string = 'Thành công',
    statusCode: number = 200,
    meta?: MetaData
): Response => {
    const response: ApiResponseSuccess<T> = {
        success: true,
        message,
        data,
        ...(meta && { meta })
    };
    return res.status(statusCode).json(response);
};

/**
 * Error Response
 */
export const errorResponse = (
    res: Response,
    message: string,
    statusCode: number = 400,
    errorCode: ErrorCode | string = ErrorCode.BAD_REQUEST,
    details?: any
): Response => {
    const response: ApiResponseError = {
        success: false,
        message,
        data: null,
        error: {
            code: errorCode,
            ...(details && { details })
        }
    };
    return res.status(statusCode).json(response);
};

/**
 * Pagination Response
 */
export const paginatedResponse = <T = any>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Lấy danh sách thành công'
): Response => {
    return successResponse(res, data, message, 200, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
};

// Quick helper functions
export const ApiResponse = {
    // Success responses
    success: successResponse,
    created: <T>(res: Response, data: T, message: string = 'Tạo mới thành công') => 
        successResponse(res, data, message, 201),
    updated: <T>(res: Response, data: T, message: string = 'Cập nhật thành công') => 
        successResponse(res, data, message, 200),
    deleted: (res: Response, message: string = 'Xóa thành công') => 
        successResponse(res, null, message, 200),
    
    // Error responses
    error: errorResponse,
    badRequest: (res: Response, message: string = 'Yêu cầu không hợp lệ', details?: any) => 
        errorResponse(res, message, 400, ErrorCode.BAD_REQUEST, details),
    unauthorized: (res: Response, message: string = 'Chưa xác thực', details?: any) => 
        errorResponse(res, message, 401, ErrorCode.UNAUTHORIZED, details),
    forbidden: (res: Response, message: string = 'Không có quyền truy cập', details?: any) => 
        errorResponse(res, message, 403, ErrorCode.FORBIDDEN, details),
    notFound: (res: Response, message: string = 'Không tìm thấy', details?: any) => 
        errorResponse(res, message, 404, ErrorCode.NOT_FOUND, details),
    conflict: (res: Response, message: string = 'Dữ liệu đã tồn tại', details?: any) => 
        errorResponse(res, message, 409, ErrorCode.CONFLICT, details),
    validationError: (res: Response, message: string = 'Dữ liệu không hợp lệ', details?: any) => 
        errorResponse(res, message, 422, ErrorCode.VALIDATION_ERROR, details),
    serverError: (res: Response, message: string = 'Lỗi server. Vui lòng thử lại sau.', details?: any) => 
        errorResponse(res, message, 500, ErrorCode.INTERNAL_ERROR, details),
    
    // Paginated response
    paginated: paginatedResponse,
};

export default ApiResponse;
