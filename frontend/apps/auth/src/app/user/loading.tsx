import '../../static/server-loading.css';

type LoadingProps = { isRoot?: boolean };

const Content = ({ isRoot = false }) => (
  <div
    style={{
      flex: 'auto',
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: '480px',
      margin: 'auto',
      paddingBottom: isRoot ? '34px' : '0',
      background: isRoot ? '#fff' : 'transparent',
      borderRadius: '6px',
    }}
  >
    <div
      className="server-shimmer"
      style={{
        display: 'block',
        height: '20px',
        marginLeft: '20px',
        marginTop: '18px',
        width: '25px',
      }}
    />
    <div
      className="server-shimmer"
      style={{
        display: 'block',
        height: '22px',
        margin: '39px auto 14px auto',
        width: '209px',
      }}
    />
    <div
      className="server-shimmer"
      style={{
        display: 'block',
        height: '22px',
        margin: '15px auto',
        width: '315px',
      }}
    />
    <div
      className="server-shimmer"
      style={{
        display: 'block',
        height: '56px',
        margin: '23px auto 10px auto',
        width: 'calc(100% - 35px)',
      }}
    />
    <div
      className="server-shimmer"
      style={{
        display: 'block',
        height: '56px',
        margin: '0 auto 10px auto',
        width: 'calc(100% - 35px)',
      }}
    />
    <div
      className="server-shimmer"
      style={{
        display: 'block',
        height: '56px',
        margin: '0 auto 21px auto',
        width: 'calc(100% - 35px)',
      }}
    />
    <div
      className="server-shimmer"
      style={{
        display: 'block',
        height: '48px',
        margin: '0 auto',
        width: 'calc(100% - 35px)',
      }}
    />
  </div>
);

const Loading = ({ isRoot = false }: LoadingProps) =>
  isRoot ? (
    <div
      style={{
        display: 'flex',
        height: '100%',
        margin: '0 auto',
        maxWidth: '480px',
        flexBasis: '480px',
      }}
    >
      <Content isRoot />
    </div>
  ) : (
    <Content />
  );

export default Loading;
