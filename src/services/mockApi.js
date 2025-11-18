// Mock data
const mockData = {
  user: {
    uid: 'mock-uid-123',
    email: '2051120001@vku.udn.vn',
    displayName: 'Nguyễn Văn An',
    photoUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    studentCode: '2051120001',
    isNewUser: false
  },
  
  availableCourses: [
    {
      id: 1,
      courseId: 1,
      courseName: 'An toàn ứng dụng Web và CSDL',
      courseCode: 'CS301',
      credit: 3,
      semesterId: 1,
      semesterName: 'HK1 2024-2025',
      sectionNumber: '1',
      language: 'Tiếng Việt',
      major: 'Công nghệ Thông tin',
      instructorName: 'ThS.Trần Thanh Liêm',
      instructorEmail: 'liemtt@vku.udn.vn',
      dayOfWeek: 'Thứ Bảy',
      periods: [1, 2, 3],
      area: 'K',
      room: 'A107',
      capacity: 60,
      currentEnrolled: 45,
      status: 'OPEN'
    },
    {
      id: 2,
      courseId: 1,
      courseName: 'An toàn ứng dụng Web và CSDL',
      courseCode: 'CS301',
      credit: 3,
      semesterId: 1,
      semesterName: 'HK1 2024-2025',
      sectionNumber: '2',
      language: 'Tiếng Việt',
      major: 'Công nghệ Thông tin',
      instructorName: 'ThS.Trần Thanh Liêm',
      instructorEmail: 'liemtt@vku.udn.vn',
      dayOfWeek: 'Thứ Hai',
      periods: [4, 5, 6],
      area: 'A',
      room: 'B201',
      capacity: 60,
      currentEnrolled: 58,
      status: 'OPEN'
    },
    {
      id: 3,
      courseId: 2,
      courseName: 'Lập trình Web nâng cao',
      courseCode: 'CS302',
      credit: 4,
      semesterId: 1,
      semesterName: 'HK1 2024-2025',
      sectionNumber: '1',
      language: 'Tiếng Việt',
      major: 'Công nghệ Thông tin',
      instructorName: 'TS.Nguyễn Văn A',
      instructorEmail: 'nguyenvana@vku.udn.vn',
      dayOfWeek: 'Thứ Ba',
      periods: [1, 2, 3, 4],
      area: 'K',
      room: 'A108',
      capacity: 50,
      currentEnrolled: 50,
      status: 'FULL'
    },
    {
      id: 4,
      courseId: 3,
      courseName: 'Cấu trúc dữ liệu và Giải thuật',
      courseCode: 'CS201',
      credit: 4,
      semesterId: 1,
      semesterName: 'HK1 2024-2025',
      sectionNumber: '1',
      language: 'Tiếng Việt',
      major: 'Công nghệ Thông tin',
      instructorName: 'ThS.Lê Thị B',
      instructorEmail: 'lethib@vku.udn.vn',
      dayOfWeek: 'Thứ Năm',
      periods: [1, 2, 3],
      area: 'K',
      room: 'A105',
      capacity: 70,
      currentEnrolled: 42,
      status: 'OPEN'
    },
    {
      id: 5,
      courseId: 4,
      courseName: 'Lập trình căn bản',
      courseCode: 'CS101',
      credit: 3,
      semesterId: 1,
      semesterName: 'HK1 2024-2025',
      sectionNumber: '1',
      language: 'Tiếng Việt',
      major: 'Công nghệ Thông tin',
      instructorName: 'ThS.Phạm Văn C',
      instructorEmail: 'phamvanc@vku.udn.vn',
      dayOfWeek: 'Thứ Tư',
      periods: [7, 8, 9],
      area: 'A',
      room: 'B105',
      capacity: 60,
      currentEnrolled: 30,
      status: 'OPEN'
    }
  ],
  
  myEnrollments: []
};

// Helper to simulate API delay
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Auth API
export const mockAuthAPI = {
  login: async (idToken) => {
    await delay();
    console.log('Mock login with token:', idToken);
    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: mockData.user
    };
  },
  
  verify: async (idToken) => {
    await delay();
    return {
      success: true,
      message: 'Token hợp lệ',
      data: mockData.user
    };
  }
};

// Mock Student API
export const mockStudentAPI = {
  getAvailableCourses: async (params = {}) => {
    await delay();
    let data = [...mockData.availableCourses];
    
    // Filter by keyword
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      data = data.filter(course => 
        course.courseName.toLowerCase().includes(keyword) ||
        course.courseCode.toLowerCase().includes(keyword)
      );
    }
    
    // Filter by faculty
    if (params.facultyId) {
      data = data.filter(course => course.major === params.facultyId);
    }
    
    return {
      success: true,
      message: 'Success',
      data
    };
  },
  
  getMyEnrollments: async () => {
    await delay();
    return {
      success: true,
      message: 'Success',
      data: mockData.myEnrollments
    };
  },
  
  registerCourse: async (classSectionId) => {
    await delay();
    
    // Find the course
    const course = mockData.availableCourses.find(c => c.id === classSectionId);
    if (!course) {
      throw new Error('Lớp học phần không tồn tại');
    }
    
    // Check if already enrolled
    const alreadyEnrolled = mockData.myEnrollments.find(e => e.classSectionId === classSectionId);
    if (alreadyEnrolled) {
      throw new Error('Bạn đã đăng ký lớp này rồi');
    }
    
    // Check capacity
    if (course.currentEnrolled >= course.capacity) {
      throw new Error('Lớp đã đầy');
    }
    
    // Create enrollment
    const enrollment = {
      id: mockData.myEnrollments.length + 1,
      classSectionId: course.id,
      courseId: course.courseId,
      courseName: course.courseName,
      courseCode: course.courseCode,
      credit: course.credit,
      sectionNumber: course.sectionNumber,
      instructorName: course.instructorName,
      instructorEmail: course.instructorEmail,
      dayOfWeek: course.dayOfWeek,
      periods: course.periods,
      area: course.area,
      room: course.room,
      status: 'ENROLLED',
      registeredAt: new Date().toISOString()
    };
    
    mockData.myEnrollments.push(enrollment);
    
    // Update enrolled count
    course.currentEnrolled++;
    if (course.currentEnrolled >= course.capacity) {
      course.status = 'FULL';
    }
    
    return {
      success: true,
      message: 'Đăng ký thành công',
      data: enrollment
    };
  },
  
  dropCourse: async (enrollmentId) => {
    await delay();
    
    const index = mockData.myEnrollments.findIndex(e => e.id === enrollmentId);
    if (index === -1) {
      throw new Error('Không tìm thấy đăng ký');
    }
    
    const enrollment = mockData.myEnrollments[index];
    
    // Update course enrolled count
    const course = mockData.availableCourses.find(c => c.id === enrollment.classSectionId);
    if (course) {
      course.currentEnrolled--;
      if (course.currentEnrolled < course.capacity) {
        course.status = 'OPEN';
      }
    }
    
    // Remove enrollment
    mockData.myEnrollments.splice(index, 1);
    
    return {
      success: true,
      message: 'Hủy đăng ký thành công',
      data: null
    };
  }
};

export default {
  authAPI: mockAuthAPI,
  studentAPI: mockStudentAPI
};
