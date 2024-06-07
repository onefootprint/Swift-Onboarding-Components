import '@/static/server-shimmer.css';

import React from 'react';

const Loading = () => (
  <div
    style={{
      width: '100%',
      maxWidth: '477px',
      margin: '0 auto',
      paddingTop: '15%',
    }}
  >
    <div className="server-shimmer block" style={{ height: '23px', margin: '0 auto', maxWidth: '119px' }} />
    <div className="server-shimmer block" style={{ height: '42px', margin: '12px auto', maxWidth: '440px' }} />
    <div className="server-shimmer block" style={{ height: '36px', margin: '20px auto', maxWidth: '91px' }} />
  </div>
);

export default Loading;
