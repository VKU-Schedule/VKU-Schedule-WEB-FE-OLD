import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import { BookOpen, Calendar, LogOut, CheckCircle } from 'lucide-react';

const Home = () => {
    const { user, signOut } = useAuth();
    const [availableCourses, setAvailableCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('available');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, enrollmentsRes] = await Promise.all([
                studentAPI.getAvailableCourses(),
                studentAPI.getMyEnrollments(),
            ]);
            setAvailableCourses(coursesRes.data || []);
            setMyEnrollments(enrollmentsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (classSectionId) => {
        if (!confirm('Bạn có chắc muốn đăng ký lớp học phần này?')) return;

        try {
            await studentAPI.registerCourse(classSectionId);
            alert('Đăng ký thành công!');
            fetchData();
        } catch (error) {
            alert('Đăng ký thất bại: ' + error.message);
        }
    };

    const handleDrop = async (enrollmentId) => {
        if (!confirm('Bạn có chắc muốn hủy đăng ký lớp này?')) return;

        try {
            await studentAPI.dropCourse(enrollmentId);
            alert('Hủy đăng ký thành công!');
            fetchData();
        } catch (error) {
            alert('Hủy đăng ký thất bại: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">VKU Schedule</h1>
                        <p className="text-sm text-gray-600">Xin chào, {user?.displayName}</p>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        Đăng xuất
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${activeTab === 'available'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <BookOpen size={20} />
                        Lớp học phần
                    </button>
                    <button
                        onClick={() => setActiveTab('enrolled')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${activeTab === 'enrolled'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Calendar size={20} />
                        Đã đăng ký ({myEnrollments.length})
                    </button>
                </div>

                {/* Available Courses */}
                {activeTab === 'available' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn học</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảng viên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lịch học</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sỉ số</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {availableCourses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{course.courseName}</div>
                                                <div className="text-sm text-gray-500">{course.courseCode}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{course.sectionNumber}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">{course.instructorName}</div>
                                                <div className="text-xs text-gray-500">{course.language}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {course.dayOfWeek} - Tiết {course.periods?.join(', ')}
                                            </td>
                                            <td className="px-6 py-4 text-sm">{course.area}{course.room}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={course.currentEnrolled >= course.capacity ? 'text-red-600' : 'text-green-600'}>
                                                    {course.currentEnrolled}/{course.capacity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleRegister(course.id)}
                                                    disabled={course.status !== 'OPEN'}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    {course.status === 'OPEN' ? 'Đăng ký' : 'Đã đầy'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {availableCourses.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                Không có lớp học phần nào
                            </div>
                        )}
                    </div>
                )}

                {/* My Enrollments */}
                {activeTab === 'enrolled' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn học</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảng viên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lịch học</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {myEnrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{enrollment.courseName}</div>
                                                <div className="text-sm text-gray-500">{enrollment.courseCode}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{enrollment.sectionNumber}</td>
                                            <td className="px-6 py-4 text-sm">{enrollment.instructorName}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {enrollment.dayOfWeek} - Tiết {enrollment.periods?.join(', ')}
                                            </td>
                                            <td className="px-6 py-4 text-sm">{enrollment.area}{enrollment.room}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                                    <CheckCircle size={14} />
                                                    {enrollment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDrop(enrollment.id)}
                                                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                >
                                                    Hủy đăng ký
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {myEnrollments.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                Bạn chưa đăng ký lớp học phần nào
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
