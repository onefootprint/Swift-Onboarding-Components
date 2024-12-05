import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import request from '../config/request';
import loading from '../images/loading.svg';

const Waiting = ({ onSuccess }) => {
  const [error, setError] = useState('');
  const { fpId } = useContext(AppContext);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await request({
          url: '/check',
          method: 'post',
          data: { fpId },
        });
        if (response.data.status === 'pass') {
          onSuccess();
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setError('An error occurred while checking status.');
      }
    };

    const intervalId = setInterval(checkStatus, 2000);

    return () => clearInterval(intervalId);
  }, [fpId, onSuccess]);

  return (
    <div className="app-form waiting-step">
      <header className="header">
        <h1 className="title">Waiting for customer...</h1>
        <h2 className="subtitle">
          Text message sent to customer's phone number. Ask them to continue from their phone.
        </h2>
        <img src={loading} className="loading-spinner" width={32} height={32} alt="Loading" />
        {error && <p className="form-error">{error}</p>}
      </header>
    </div>
  );
};

export default Waiting;
