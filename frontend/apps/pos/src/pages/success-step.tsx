import success from '../images/success.png';

const Success = () => {
  return (
    <div className="app-form success-step">
      <header className="header">
        <img src={success} alt="Success" className="success-img" width={40} height={40} />
        <h1 className="title">Pass!</h1>
        <h2 className="subtitle">Their identity was successfully verified!</h2>
      </header>
    </div>
  );
};

export default Success;
