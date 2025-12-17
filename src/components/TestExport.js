import React from 'react';

function TestExport() {
  const testGoogleCalendar = () => {
    const eventTitle = 'Test Event';
    const startDate = '20241218T073000Z';
    const endDate = '20241218T082000Z';
    const description = 'This is a test event';
    const location = 'Test Room';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    
    console.log('Opening URL:', googleCalendarUrl);
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Export Functions</h2>
      <button 
        onClick={testGoogleCalendar}
        style={{
          background: '#4285f4',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Google Calendar Export
      </button>
    </div>
  );
}

export default TestExport;