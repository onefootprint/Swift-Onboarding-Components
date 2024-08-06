import '@/static/server-shimmer.css';

const Loading = () => (
  <>
    <div className="server-shimmer block" style={{ height: '20px', marginTop: '5px', maxWidth: '124px' }} />
    <div className="server-shimmer block" style={{ height: '20px', marginTop: '10px', maxWidth: '546px' }} />
    <div className="server-shimmer block" style={{ height: '20px', marginTop: '3px', maxWidth: '145px' }} />
    <div className="server-shimmer block" style={{ height: '32px', marginTop: '25px', maxWidth: '333px' }} />
    <div className="server-shimmer block" style={{ height: '132px', marginTop: '16px' }} />
  </>
);

export default Loading;
