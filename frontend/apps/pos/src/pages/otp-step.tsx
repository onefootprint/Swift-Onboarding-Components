import { useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { AppContext } from '../App';
import PinInput from '../components/pin-input';
import useFootprint from '../hooks/use-footprint';
import logo from '../images/avis.png';
import loading from '../images/loading.svg';
import success from '../images/success.png';

const OtpStep = ({ onSuccess }) => {
  const { verify } = useFootprint();
  const { phoneNumber } = useContext(AppContext);
  const [verificationError, setVerificationError] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const verifyMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      await verify(verificationCode);
    },
    onSuccess: () => {
      setIsWaiting(true);
      setTimeout(() => {
        setIsWaiting(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }, 1500);
    },
    onError: () => {
      setVerificationError('Verification failed. Please try again.');
    },
  });

  const handleSubmit = async (verificationCode: string) => {
    verifyMutation.mutate(verificationCode);
  };

  return (
    <div className="app-form otp-step">
      <header className="header">
        <img src={logo} alt="Avis Logo" className="logo" width={92} height={30} />
        <h1 className="title">Verify their phone number</h1>
        <h2 className="subtitle">Enter the 6-digit code sent to {phoneNumber}.</h2>
        {isSuccess || isWaiting ? (
          <div style={{ height: 95 }}>
            <img src={success} alt="Success" className="success-img" width={40} height={40} />
            <p style={{ marginTop: 24, color: '#0A6A4A' }}>Success!</p>
          </div>
        ) : (
          <>
            {verifyMutation.isPending ? (
              <div style={{ height: 95 }}>
                <img src={loading} className="loading-spinner" width={32} height={32} alt="Loading" />
                <p style={{ marginTop: 24 }}>Verifying...</p>
              </div>
            ) : (
              <>
                <PinInput onComplete={handleSubmit} />
                {verifyMutation.error && <p className="form-error">{verifyMutation.error.message}</p>}
                {verificationError && <p className="form-error">{verificationError}</p>}
                <button className="link-button" type="button" disabled={verifyMutation.isPending}>
                  Resend code
                </button>
              </>
            )}
          </>
        )}
      </header>
    </div>
  );
};

export default OtpStep;
