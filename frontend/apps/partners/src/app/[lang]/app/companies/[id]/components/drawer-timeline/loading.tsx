import '@/static/server-shimmer.css';

const Loading = () => (
  <>
    <div className="server-shimmer block" style={{ height: '16px', maxWidth: '450px' }} />
    <div
      className="server-shimmer block"
      style={{
        height: '17px',
        marginTop: '9px',
        maxWidth: '273px',
        marginLeft: '40px',
      }}
    />
    <div className="server-shimmer block" style={{ height: '16px', marginTop: '38px', maxWidth: '450px' }} />
    <div
      className="server-shimmer block"
      style={{
        height: '14px',
        marginTop: '8px',
        maxWidth: '71px',
        marginLeft: '29px',
      }}
    />
    <div className="server-shimmer block" style={{ height: '16px', marginTop: '54px', maxWidth: '450px' }} />
    <div
      className="server-shimmer block"
      style={{
        height: '14px',
        marginTop: '8px',
        maxWidth: '71px',
        marginLeft: '29px',
      }}
    />
    <div className="server-shimmer block" style={{ height: '132px', marginTop: '16px' }} />
  </>
);

export default Loading;
