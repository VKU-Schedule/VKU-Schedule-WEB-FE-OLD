import React, { useState } from 'react';
import '../styles/CalendarExportModal.css';

function CalendarExportModal({ isOpen, onClose, onExport, scheduleData, scheduleIndex }) {
  const [selectedCalendars, setSelectedCalendars] = useState({
    google: true,
    outlook: false,
    apple: false,
    downloadICS: false
  });

  const handleCheckboxChange = (calendar) => {
    setSelectedCalendars(prev => ({
      ...prev,
      [calendar]: !prev[calendar]
    }));
  };

  const handleExport = () => {
    const selected = Object.keys(selectedCalendars).filter(key => selectedCalendars[key]);
    if (selected.length === 0) {
      alert('Vui lòng chọn ít nhất một calendar!');
      return;
    }
    onExport(selected, scheduleData, scheduleIndex);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📅 Xuất lịch học</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Chọn ứng dụng lịch bạn muốn xuất thời khóa biểu:
          </p>
          
          <div className="calendar-options">
            <div className="calendar-group">
              <h4>📱 Ứng dụng lịch trực tuyến</h4>
              
              <label className="calendar-option">
                <input
                  type="checkbox"
                  checked={selectedCalendars.google}
                  onChange={() => handleCheckboxChange('google')}
                />
                <div className="checkbox-custom google"></div>
                <div className="option-info">
                  <span className="option-name">Google Calendar</span>
                  <span className="option-desc">Mở trực tiếp trong trình duyệt</span>
                </div>
              </label>

              <label className="calendar-option">
                <input
                  type="checkbox"
                  checked={selectedCalendars.outlook}
                  onChange={() => handleCheckboxChange('outlook')}
                />
                <div className="checkbox-custom outlook"></div>
                <div className="option-info">
                  <span className="option-name">Outlook Web</span>
                  <span className="option-desc">Mở trong Outlook online</span>
                </div>
              </label>
            </div>

            <div className="calendar-group">
              <h4>💻 Ứng dụng máy tính & điện thoại</h4>
              
              <label className="calendar-option">
                <input
                  type="checkbox"
                  checked={selectedCalendars.apple}
                  onChange={() => handleCheckboxChange('apple')}
                />
                <div className="checkbox-custom apple"></div>
                <div className="option-info">
                  <span className="option-name">Apple Calendar</span>
                  <span className="option-desc">iPhone, iPad, Mac</span>
                </div>
              </label>

              <label className="calendar-option">
                <input
                  type="checkbox"
                  checked={selectedCalendars.downloadICS}
                  onChange={() => handleCheckboxChange('downloadICS')}
                />
                <div className="checkbox-custom download"></div>
                <div className="option-info">
                  <span className="option-name">Tải file .ics</span>
                  <span className="option-desc">Cho Outlook desktop, Android, v.v.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-export" onClick={handleExport}>
            🚀 Xuất lịch
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarExportModal;