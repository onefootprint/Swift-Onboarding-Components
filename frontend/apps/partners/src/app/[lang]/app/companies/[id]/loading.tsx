import '@/static/server-shimmer.css';

import React from 'react';

const Loading = () => (
  <>
    <div className="server-shimmer block" style={{ height: '20px', marginTop: '2px', maxWidth: '176px' }} />
    <div className="server-shimmer block" style={{ height: '20px', marginTop: '27px', maxWidth: '121px' }} />
    <div className="server-shimmer block" style={{ height: '75px', marginTop: '21px' }} />
    <div className="server-shimmer block" style={{ height: '32px', marginTop: '16px', maxWidth: '333px' }} />
    <div className="server-shimmer block" style={{ height: '132px', marginTop: '16px' }} />
  </>
);

export default Loading;
