import React, { useState } from 'react';
// import { signInWithPopup } from 'firebase/auth';
// import { auth, googleProvider } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

// Mock Firebase auth for development
const mockSignInWithPopup = async () => {
    return {
        user: {
            uid: 'mock-uid-123',
            email: '2051120001@vku.udn.vn',
            displayName: 'Nguyễn Văn An',
            photoURL: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        }
    };
};

const signInWithPopup = mockSignInWithPopup;
const auth = { signOut: async () => { } };
const googleProvider = {};

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError('');

            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email;

            // Check if email is from vku.udn.vn
            if (!email.endsWith('@vku.udn.vn')) {
                await auth.signOut();
                setError('Chỉ cho phép đăng nhập bằng email @vku.udn.vn');
                return;
            }

            // Navigate to home after successful login
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        VKU Schedule
                    </h1>
                    <p className="text-gray-600">Hệ thống đăng ký tín chỉ</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition disabled:opacity-50"
                >
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Google'}
                </button>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Chỉ dành cho sinh viên VKU</p>
                    <p className="text-xs mt-1">Email: @vku.udn.vn</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
