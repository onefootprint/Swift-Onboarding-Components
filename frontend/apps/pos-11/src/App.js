import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import loading from './images/loading.svg';
import success from './images/success.png';
import logo from './images/avis.png';
import fp from './images/fp.png';

const request = axios.create({
  baseURL: 'https://pos.preview.onefootprint.com/api/',
});

function App() {
  const [step, setStep] = useState('intro');
  const [fpId, setFpId] = useState('');

  return (
    <div className="App">
      {step === 'intro' ? (
        <Intro
          onDone={fpId => {
            setFpId(fpId);
            setStep('waiting');
          }}
        />
      ) : null}
      {step === 'waiting' ? (
        <Waiting
          fpId={fpId}
          onSuccess={() => {
            setStep('success');
          }}
        />
      ) : null}
      {step === 'success' ? <Success /> : null}
      <footer>
        <img src={fp} width={16} height={17} alt="Footprint" />
        Powered by Footprint
      </footer>
    </div>
  );
}

const Intro = ({ onDone }) => {
  const [tel, setTel] = useState('');
  const [requestState, setRequestState] = useState({ isLoading: false, error: '' });
  const [validationErrors, setValidationErrors] = useState('');

  const start = async phoneNumber => {
    setRequestState(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      const response = await request({ url: '/start', method: 'post', data: { phoneNumber } });
      onDone(response.data.fpId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data);
        setRequestState(prev => ({ ...prev, isLoading: false, error: 'An error occurred. Please try again.' }));
      }
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!tel.trim()) {
      setValidationErrors('Phone number is required');
    } else {
      setValidationErrors('');
      start(tel);
    }
  };

  const handleChange = e => {
    setTel(e.target.value);
    setValidationErrors('');
    setRequestState(prev => ({ ...prev, apiError: '' }));
  };

  return (
    <div className="app-form intro-step">
      <header className="header">
        <img src={logo} alt="Avis Logo" className="logo" width={92} height={30} />
        <h1 className="title">Let's verify your customer's identity!</h1>
        <h2 className="subtitle">Enter their phone number to proceed.</h2>
      </header>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="tel">
            Phone number
          </label>
          <input id="tel" className="form-input" placeholder="+1 555-555-0100" value={tel} onChange={handleChange} />
          {validationErrors && <p className="form-error">{validationErrors}</p>}
          {requestState.apiError && <p className="form-error">{requestState.apiError}</p>}
        </div>
        <div className="form-button">
          <button type="submit" className="button-primary" disabled={requestState.isLoading}>
            {requestState.isLoading ? 'Verifying...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Waiting = ({ fpId, onSuccess }) => {
  const [error, setError] = useState('');

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
  }, [fpId]);

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

export default App;
