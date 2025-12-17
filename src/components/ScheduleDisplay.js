import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarExportModal from './CalendarExportModal';
import '../styles/ScheduleDisplay.css';

function ScheduleDisplay() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Đang khởi tạo...');
  const [error, setError] = useState(null);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState({
    subject: '',
    teacher: '',
    time: '',
    room: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const payload = JSON.parse(localStorage.getItem('schedule_payload'));

    if (!payload) {
      alert('⚠️ Không có dữ liệu truy vấn. Quay lại trang trước.');
      navigate('/');
      return;
    }

    // Simulate loading progress
    const loadingSteps = [
      { progress: 10, text: 'Đang phân tích dữ liệu...' },
      { progress: 25, text: 'Đang tìm kiếm môn học...' },
      { progress: 45, text: 'Đang xử lý thời khóa biểu...' },
      { progress: 70, text: 'Đang tối ưu hóa lịch học...' },
      { progress: 90, text: 'Đang hoàn thiện...' }
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < loadingSteps.length) {
        setLoadingProgress(loadingSteps[stepIndex].progress);
        setLoadingText(loadingSteps[stepIndex].text);
        stepIndex++;
      }
    }, 800);

    // http://127.0.0.1:5000/api/convert
    fetch('http://20.106.16.223:5000/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Server responded with an error');
        return res.json();
      })
      .then(data => {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setLoadingText('Hoàn thành!');
        
        setTimeout(() => {
          setSchedules(data.schedules || []);
          setLoading(false);
        }, 500);
      })
      .catch(err => {
        clearInterval(progressInterval);
        console.error('❌ Lỗi API:', err);
        setError('Không thể tạo thời khóa biểu.');
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner">🔄</div>
          <h2 className="loading-title">Đang tạo thời khóa biểu</h2>
          <p className="loading-text">{loadingText}</p>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <span className="progress-percentage">{loadingProgress}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">❌ {error}</p>
        <button onClick={() => navigate('/')}>Quay lại</button>
      </div>
    );
  }

  const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const periodLabels = [
    'Tiết 1: 07h30',
    'Tiết 2: 08h30',
    'Tiết 3: 09h30',
    'Tiết 4: 10h30',
    'Tiết 5: 11h30',
    'Tiết 6: 13h00',
    'Tiết 7: 14h00',
    'Tiết 8: 15h00',
    'Tiết 9: 16h00',
    'Tiết 10: 17h00'
  ];
  const courseColors = ['darkgreen', 'darkbrown', 'navyblue', 'darkblue', 'darkred'];

  // Map Vietnamese days to numbers (Monday = 1, Sunday = 0)
  const dayToNumber = {
    'Thứ Hai': 1,
    'Thứ Ba': 2, 
    'Thứ Tư': 3,
    'Thứ Năm': 4,
    'Thứ Sáu': 5,
    'Thứ Bảy': 6
  };

  // Period times in 24-hour format
  const periodTimes = [
    { start: '07:30', end: '08:20' },
    { start: '08:30', end: '09:20' },
    { start: '09:30', end: '10:20' },
    { start: '10:30', end: '11:20' },
    { start: '11:30', end: '12:20' },
    { start: '13:00', end: '13:50' },
    { start: '14:00', end: '14:50' },
    { start: '15:00', end: '15:50' },
    { start: '16:00', end: '16:50' },
    { start: '17:00', end: '17:50' }
  ];

  const openExportModal = (scheduleObj, scheduleIndex) => {
    setCurrentSchedule(scheduleObj);
    setCurrentScheduleIndex(scheduleIndex);
    setShowModal(true);
  };

  const handleExport = (selectedCalendars, scheduleData, scheduleIndex) => {
    selectedCalendars.forEach((calendarType, index) => {
      setTimeout(() => {
        switch (calendarType) {
          case 'google':
            exportToGoogleCalendar(scheduleData, scheduleIndex);
            break;
          case 'outlook':
            exportToOutlookWeb(scheduleData, scheduleIndex);
            break;
          case 'apple':
            downloadICSFile(scheduleData, scheduleIndex);
            break;
          case 'downloadICS':
            downloadICSFile(scheduleData, scheduleIndex);
            break;
          default:
            break;
        }
      }, index * 1000);
    });
  };

  const exportToGoogleCalendar = (scheduleObj, scheduleIndex) => {
    const timetableData = scheduleObj.schedule;
    
    // Get current date and calculate semester start (assuming current week is week 1)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOfThisWeek = new Date(today);
    mondayOfThisWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    // Create events for each course
    timetableData.forEach((courseData, courseIndex) => {
      const courseName = courseData[0];
      const info = courseData[1];
      
      const dayNumber = dayToNumber[info.day];
      if (!dayNumber) return;
      
      const startPeriod = Math.min(...info.periods);
      const endPeriod = Math.max(...info.periods);
      
      const startTime = periodTimes[startPeriod - 1].start;
      const endTime = periodTimes[endPeriod - 1].end;
      
      // Calculate the date for this day of the week
      const eventDate = new Date(mondayOfThisWeek);
      eventDate.setDate(mondayOfThisWeek.getDate() + (dayNumber - 1));
      
      const formatGoogleDateTime = (date, time) => {
        const [hours, minutes] = time.split(':');
        const eventDateTime = new Date(date);
        eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return eventDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const startDateTime = formatGoogleDateTime(eventDate, startTime);
      const endDateTime = formatGoogleDateTime(eventDate, endTime);
      
      const roomCode = `${info.area}.${info.room}`;
      const subTopic = info.sub_topic?.trim() ?? '';
      const courseInfo = `${courseName} (${info.class_index})${subTopic ? '_' + subTopic : ''}`;
      
      const description = `Giáo viên: ${info.teacher}%0APhòng: ${roomCode}%0AThời gian: ${startTime} - ${endTime}`;
      
      // Create Google Calendar URL
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(courseInfo)}&dates=${startDateTime}/${endDateTime}&details=${description}&location=${encodeURIComponent(roomCode)}&recur=RRULE:FREQ=WEEKLY;COUNT=16`;
      
      // Open in new tab with delay to avoid popup blocking
      setTimeout(() => {
        window.open(googleCalendarUrl, '_blank');
      }, courseIndex * 1000);
    });

    // Silently open Google Calendar events
  };

  const exportToOutlookWeb = (scheduleObj, scheduleIndex) => {
    const timetableData = scheduleObj.schedule;
    
    // Get current date and calculate semester start
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOfThisWeek = new Date(today);
    mondayOfThisWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    // Create events for each course
    timetableData.forEach((courseData, courseIndex) => {
      const courseName = courseData[0];
      const info = courseData[1];
      
      const dayNumber = dayToNumber[info.day];
      if (!dayNumber) return;
      
      const startPeriod = Math.min(...info.periods);
      const endPeriod = Math.max(...info.periods);
      
      const startTime = periodTimes[startPeriod - 1].start;
      const endTime = periodTimes[endPeriod - 1].end;
      
      // Calculate the date for this day of the week
      const eventDate = new Date(mondayOfThisWeek);
      eventDate.setDate(mondayOfThisWeek.getDate() + (dayNumber - 1));
      
      const formatOutlookDateTime = (date, time) => {
        const [hours, minutes] = time.split(':');
        const eventDateTime = new Date(date);
        eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return eventDateTime.toISOString();
      };
      
      const startDateTime = formatOutlookDateTime(eventDate, startTime);
      const endDateTime = formatOutlookDateTime(eventDate, endTime);
      
      const roomCode = `${info.area}.${info.room}`;
      const subTopic = info.sub_topic?.trim() ?? '';
      const courseInfo = `${courseName} (${info.class_index})${subTopic ? '_' + subTopic : ''}`;
      
      const description = `Giáo viên: ${info.teacher}\nPhòng: ${roomCode}\nThời gian: ${startTime} - ${endTime}`;
      
      // Create Outlook Web URL
      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(courseInfo)}&startdt=${startDateTime}&enddt=${endDateTime}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(roomCode)}`;
      
      // Open in new tab with delay
      setTimeout(() => {
        window.open(outlookUrl, '_blank');
      }, courseIndex * 1000);
    });

    // Silently open Outlook Web events
  };



  const downloadICSFile = (scheduleObj, scheduleIndex) => {
    const timetableData = scheduleObj.schedule;
    
    // Get current date and calculate semester start (assuming current week is week 1)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOfThisWeek = new Date(today);
    mondayOfThisWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//VKU Schedule//VKU Schedule App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    timetableData.forEach((courseData, courseIndex) => {
      const courseName = courseData[0];
      const info = courseData[1];
      
      const dayNumber = dayToNumber[info.day];
      if (!dayNumber) return;
      
      const startPeriod = Math.min(...info.periods);
      const endPeriod = Math.max(...info.periods);
      
      const startTime = periodTimes[startPeriod - 1].start;
      const endTime = periodTimes[endPeriod - 1].end;
      
      // Calculate the date for this day of the week
      const eventDate = new Date(mondayOfThisWeek);
      eventDate.setDate(mondayOfThisWeek.getDate() + (dayNumber - 1));
      
      const formatDateTime = (date, time) => {
        const [hours, minutes] = time.split(':');
        const eventDateTime = new Date(date);
        eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return eventDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const startDateTime = formatDateTime(eventDate, startTime);
      const endDateTime = formatDateTime(eventDate, endTime);
      
      const roomCode = `${info.area}.${info.room}`;
      const subTopic = info.sub_topic?.trim() ?? '';
      const courseInfo = `${courseName} (${info.class_index})${subTopic ? '_' + subTopic : ''}`;
      
      // Create recurring event for the semester (16 weeks)
      const rrule = 'FREQ=WEEKLY;COUNT=16';
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${scheduleIndex}-${courseIndex}-${Date.now()}@vku-schedule.com`,
        `DTSTART:${startDateTime}`,
        `DTEND:${endDateTime}`,
        `RRULE:${rrule}`,
        `SUMMARY:${courseInfo}`,
        `DESCRIPTION:Giáo viên: ${info.teacher}\\nPhòng: ${roomCode}\\nThời gian: ${startTime} - ${endTime}`,
        `LOCATION:${roomCode}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    
    const icsString = icsContent.join('\r\n');
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `thoi-khoa-bieu-${scheduleIndex + 1}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // File downloaded silently
  };

  const renderTimeTable = (scheduleObj, index) => {
    const timetableData = scheduleObj.schedule;
    
    // Create color mapping for each course
    const courseColorMap = {};
    let colorIndex = 0;
    timetableData.forEach(courseData => {
      const courseName = courseData[0];
      if (!courseColorMap[courseName]) {
        courseColorMap[courseName] = courseColors[colorIndex % courseColors.length];
        colorIndex++;
      }
    });

    // Prepare a 2D grid to track rendered cells
    const rendered = Array.from({ length: 10 }, () =>
      Object.fromEntries(days.map(d => [d, false]))
    );

    return (
      <div className="timetable-container" key={index}>
        <div className="schedule-header">
          <h1>THỜI KHÓA BIỂU {index + 1}</h1>
          <div className="export-buttons">
            <button 
              className="export-btn google-btn"
              onClick={() => exportToGoogleCalendar(scheduleObj, index)}
              title="Xuất nhanh vào Google Calendar"
            >
              🚀 Google Calendar
            </button>
            <button 
              className="export-btn more-btn"
              onClick={() => openExportModal(scheduleObj, index)}
              title="Chọn nhiều ứng dụng lịch để xuất"
            >
              📅 Chọn lịch
            </button>
          </div>
        </div>
        <div className="score-display">Điểm: {scheduleObj.score}</div>
        
        <div className="info-grid">
          <div className="info-block">
            <label>Tên HP:</label>
            <input value={selectedCourseInfo.subject} readOnly />
          </div>
          <div className="info-block">
            <label>Giáo viên:</label>
            <input value={selectedCourseInfo.teacher} readOnly />
          </div>
          <div className="info-block">
            <label>Thời gian:</label>
            <input value={selectedCourseInfo.time} readOnly />
          </div>
          <div className="info-block">
            <label>Phòng:</label>
            <input value={selectedCourseInfo.room} readOnly />
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Tiết</th>
              {days.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, periodIndex) => {
              const periodNumber = periodIndex + 1;
              
              return (
                <tr key={periodNumber}>
                  <td className="period-col">{periodLabels[periodIndex]}</td>
                  
                  {days.map(day => {
                    // Skip if cell is already rendered as part of a rowspan
                    if (rendered[periodIndex][day]) return null;
                    
                    // Check if there's a course in this time slot
                    for (const courseData of timetableData) {
                      const courseName = courseData[0];
                      const info = courseData[1];
                      
                      if (info.day !== day) continue;
                      
                      if (info.periods.includes(periodNumber)) {
                        const isStart = periodNumber === Math.min(...info.periods);
                        
                        if (isStart) {
                          const rowspan = info.periods.length;
                          const roomCode = `${info.area}.${info.room}`;
                          const subTopic = info.sub_topic?.trim() ?? '';
                          const courseInfo = `${courseName} (${info.class_index})${subTopic ? '_' + subTopic : ''}`;
                          
                          // Mark cells as rendered
                          for (let r = 0; r < rowspan; r++) {
                            if (periodIndex + r < 10) {
                              rendered[periodIndex + r][day] = true;
                            }
                          }
                          
                          return (
                            <td 
                              key={day}
                              className={`filled ${courseColorMap[courseName]}`}
                              rowSpan={rowspan}
                              onMouseOver={() => {
                                setSelectedCourseInfo({
                                  subject: courseInfo,
                                  teacher: info.teacher,
                                  time: `${periodLabels[info.periods[0] - 1].split(': ')[1]} - ${
                                    periodLabels[info.periods[info.periods.length - 1] - 1].split(': ')[1]
                                  }`,
                                  room: roomCode
                                });
                              }}
                              onMouseLeave={() => {
                                setSelectedCourseInfo({
                                  subject: '',
                                  teacher: '',
                                  time: '',
                                  room: ''
                                });
                              }}
                            >
                              {courseInfo}
                              <br />
                              <small>{roomCode}</small>
                            </td>
                          );
                        }
                        return null;
                      }
                    }
                    
                    // Empty cell
                    return <td key={day}></td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const exportAllSchedules = () => {
    const options = [
      '📅 Xuất tất cả thời khóa biểu:',
      '',
      '1. Google Calendar (Khuyến nghị)',
      '2. Tải tất cả file .ics',
      '3. Hủy'
    ].join('\n');

    const choice = prompt(options + '\n\nNhập số (1-3):');
    
    if (choice === '1') {
      schedules.forEach((schedule, index) => {
        setTimeout(() => {
          exportToGoogleCalendar(schedule, index);
        }, index * 2000); // Delay each schedule by 2 seconds
      });
    } else if (choice === '2') {
      schedules.forEach((schedule, index) => {
        setTimeout(() => {
          downloadICSFile(schedule, index);
        }, index * 500); // Delay each export by 500ms to avoid browser blocking
      });
    }
  };

  return (
    <div id="wrapper">
      {schedules.length > 1 && (
        <div className="export-all-container">
          <button 
            className="export-all-btn"
            onClick={exportAllSchedules}
            title="Xuất tất cả thời khóa biểu ra file lịch"
          >
            📅 Xuất tất cả ({schedules.length} lịch)
          </button>
        </div>
      )}
      {schedules.map((schedule, index) => renderTimeTable(schedule, index))}
      
      <CalendarExportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onExport={handleExport}
        scheduleData={currentSchedule}
        scheduleIndex={currentScheduleIndex}
      />
    </div>
  );
}

export default ScheduleDisplay;