// src/config/controllers/authentication.ts
import { Request, Response } from 'express';
import { signToken } from '../variables/jwt';
import User from '../models/User';
import ApiResponse from '../utils/apiResponse';

// Đăng nhập
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, valueLogin } = req.body;

        // Kiểm tra input
        const loginValue = email || valueLogin;
        if (!loginValue || !password) {
            return ApiResponse.badRequest(res, 'Vui lòng nhập đầy đủ email và mật khẩu');
        }

        // Tìm user
        const user = await User.findOne({ email: loginValue });
        if (!user) {
            return ApiResponse.unauthorized(res, 'Email hoặc mật khẩu không đúng');
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return ApiResponse.unauthorized(res, 'Email hoặc mật khẩu không đúng');
        }

        // Tạo JWT
        const token = signToken({
            userId: user._id.toString(),
            email: user.email
        });

        // Trả về response
        return ApiResponse.success(res, {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        }, 'Đăng nhập thành công');
    } catch (error) {
        console.error('Login error:', error);
        return ApiResponse.serverError(res);
    }
};

// Đăng ký
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return ApiResponse.badRequest(res, 'Vui lòng nhập đầy đủ thông tin');
        }

        // Kiểm tra email tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return ApiResponse.conflict(res, 'Email đã được sử dụng');
        }

        // Tạo user mới
        const user = await User.create({
            username,
            email,
            password
        });
        console.log('New user registered:', user);

        // Tạo JWT
        const token = signToken({
            userId: user._id.toString(),
            email: user.email
        });

        // Trả về response
        return ApiResponse.created(res, {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        }, 'Đăng ký thành công');
    } catch (error) {
        console.error('Register error:', error);
        return ApiResponse.serverError(res);
    }
};

// Lấy thông tin profile
export const getProfile = async (req: Request, res: Response) => {
    try {
        // userId được thêm vào req bởi middleware protect
        const userId = (req as any).userId;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return ApiResponse.notFound(res, 'Không tìm thấy người dùng');
        }

        return ApiResponse.success(res, {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        }, 'Lấy thông tin thành công');
    } catch (error) {
        console.error('Get profile error:', error);
        return ApiResponse.serverError(res);
    }
};

// Cập nhật profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { username, email, oldPassword, newPassword } = req.body;
        const file = req.file;

        const user = await User.findById(userId);
        if (!user) {
            return ApiResponse.notFound(res, 'Không tìm thấy người dùng');
        }

        // Cập nhật thông tin cơ bản
        if (username) user.username = username;
        if (email) user.email = email;

        // Cập nhật avatar nếu có file upload
        if (file) {
            user.avatar = `http://localhost:6969/uploads/${file.filename}`;
        } else if (req.body.avatar && req.body.avatar.startsWith('http')) {
            user.avatar = req.body.avatar;
        }

        // Đổi mật khẩu
        if (oldPassword && newPassword) {
            const isMatch = await user.comparePassword(oldPassword);
            if (!isMatch) {
                return ApiResponse.badRequest(res, 'Mật khẩu cũ không chính xác');
            }
            user.password = newPassword;
        }

        await user.save();

        return ApiResponse.updated(res, {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        }, 'Cập nhật thông tin thành công');

    } catch (error) {
        console.error('Update profile error:', error);
        return ApiResponse.serverError(res);
    }
};

