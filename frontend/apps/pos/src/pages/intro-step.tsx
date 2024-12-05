import { useForm, useWatch } from 'react-hook-form';
import request from '../config/request';
import useFootprint from '../hooks/use-footprint';
import useRequest from '../hooks/use-request';
import logo from '../images/avis.png';

const Intro = ({ onHandoff, onFillout }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
    trigger,
  } = useForm();
  const { createChallenge } = useFootprint();
  const { isLoading: isStartLoading, error: startError, makeRequest: makeStartRequest } = useRequest();
  const { isLoading: isChallengeLoading, error: challengeError, makeRequest: makeChallengeRequest } = useRequest();
  const phoneNumber = useWatch({ control, name: 'phoneNumber' });

  const start = async data => {
    try {
      await makeStartRequest(async () => {
        const response = await request({ url: '/start', method: 'post', data: { phoneNumber: data.phoneNumber } });
        onHandoff(response.data.fpId);
      });
    } catch (error) {
      alert('An error occurred while starting the process. Please try again.');
      console.error('Start process error:', error);
    }
  };

  const validatePhoneNumber = value => {
    const cleanedNumber = value.replace(/\D/g, '');
    return (cleanedNumber.length >= 10 && cleanedNumber.length <= 15) || 'Please enter a valid phone number';
  };

  const onSubmit = data => {
    clearErrors();
    start(data);
  };

  const handleFillout = async () => {
    const isValid = await trigger();
    if (!isValid) return;
    await makeChallengeRequest(async () => {
      await createChallenge(phoneNumber);
      onFillout(phoneNumber);
    });
  };

  return (
    <div className="app-form  intro-step">
      <header className="header">
        <img src={logo} alt="Avis Logo" className="logo" width={92} height={30} />
        <h1 className="title">Let's verify your customer's identity!</h1>
        <h2 className="subtitle">Enter their phone number to proceed.</h2>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-field">
          <label className="form-label" htmlFor="phoneNumber">
            Phone number
          </label>
          <input
            id="phoneNumber"
            className="form-input"
            placeholder="+1 555-555-0100"
            {...register('phoneNumber', { required: 'Phone number is required', validate: validatePhoneNumber })}
          />
          {errors.phoneNumber?.message && <p className="form-error">{errors.phoneNumber.message as string}</p>}
          {startError && <p className="form-error">{startError}</p>}
          {challengeError && <p className="form-error">{challengeError}</p>}
        </div>
        <div className="form-button">
          <button type="submit" className="button button-primary" disabled={isStartLoading || isChallengeLoading}>
            {isStartLoading ? 'Verifying...' : 'Continue'}
          </button>
          <div className="or-container">
            <div className="or-divider" />
            <div className="or-text">or</div>
            <div className="or-divider" />
          </div>
          <button
            type="button"
            className="button button-secondary"
            disabled={isStartLoading || isChallengeLoading}
            onClick={handleFillout}
          >
            {isChallengeLoading ? 'Creating challenge...' : 'Fill out for customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Intro;
