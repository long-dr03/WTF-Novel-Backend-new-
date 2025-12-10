// src/config/controllers/authentication.ts
import { Request, Response } from 'express';
import { signToken } from '../variables/jwt';
import User from '../models/User';

// Đăng nhập
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, valueLogin } = req.body;

        // Kiểm tra input
        const loginValue = email || valueLogin;
        if (!loginValue || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng nhập đầy đủ email và mật khẩu'
            });
        }

        // Tìm user
        const user = await User.findOne({ email: loginValue });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Tạo JWT
        const token = signToken({
            userId: user._id.toString(),
            email: user.email
        });

        // Trả về response
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server. Vui lòng thử lại sau.'
        });
    }
};

// Đăng ký
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        // Kiểm tra email tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email đã được sử dụng'
            });
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
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server. Vui lòng thử lại sau.'
        });
    }
};

// Lấy thông tin profile
export const getProfile = async (req: Request, res: Response) => {
    try {
        // userId được thêm vào req bởi middleware protect
        const userId = (req as any).userId;

        const user = await User.findById(userId).select('-password'); // Không trả về password

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server. Vui lòng thử lại sau.'
        });
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
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy người dùng'
            });
        }

        // Cập nhật thông tin cơ bản
        if (username) user.username = username;
        if (email) user.email = email;

        // Cập nhật avatar nếu có file upload
        if (file) {
            // Lưu đường dẫn file (ví dụ: /uploads/filename.jpg)
            // Trong thực tế nên upload lên cloud (S3, Cloudinary)
            user.avatar = `http://localhost:6969/uploads/${file.filename}`;
        } else if (req.body.avatar && req.body.avatar.startsWith('http')) {
            // Trường hợp user nhập URL ảnh trực tiếp (nếu hỗ trợ)
            user.avatar = req.body.avatar;
        }

        // Đổi mật khẩu
        if (oldPassword && newPassword) {
            const isMatch = await user.comparePassword(oldPassword);
            if (!isMatch) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Mật khẩu cũ không chính xác'
                });
            }
            user.password = newPassword;
        }

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin thành công',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server. Vui lòng thử lại sau.'
        });
    }
};
