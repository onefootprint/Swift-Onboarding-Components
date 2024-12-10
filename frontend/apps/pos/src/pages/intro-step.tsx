import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import request from '../config/request';
import useFootprint from '../hooks/use-footprint';
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
  const phoneNumber = useWatch({ control, name: 'phoneNumber' });

  const startMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const response = await request({ url: '/start', method: 'post', data: { phoneNumber: data.phoneNumber } });
      return response.data;
    },
    onSuccess: data => {
      onHandoff(data.fpId);
    },
    onError: error => {
      alert('An error occurred while starting the process. Please try again.');
      console.error('Start process error:', error);
    },
  });

  const challengeMutation = useMutation({
    mutationFn: async () => {
      await createChallenge(phoneNumber);
    },
    onSuccess: () => {
      onFillout(phoneNumber);
    },
  });

  const validatePhoneNumber = value => {
    const cleanedNumber = value.replace(/\D/g, '');
    return (cleanedNumber.length >= 10 && cleanedNumber.length <= 15) || 'Please enter a valid phone number';
  };

  const onSubmit = data => {
    clearErrors();
    startMutation.mutate(data);
  };

  const handleFillout = async () => {
    const isValid = await trigger();
    if (!isValid) return;
    challengeMutation.mutate();
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
          {startMutation.error && <p className="form-error">{startMutation.error.message}</p>}
          {challengeMutation.error && <p className="form-error">{challengeMutation.error.message}</p>}
        </div>
        <div className="form-button">
          <button
            type="submit"
            className="button button-primary"
            disabled={startMutation.isPending || challengeMutation.isPending}
          >
            {startMutation.isPending ? 'Verifying...' : 'Continue'}
          </button>
          <div className="or-container">
            <div className="or-divider" />
            <div className="or-text">or</div>
            <div className="or-divider" />
          </div>
          <button
            type="button"
            className="button button-secondary"
            disabled={startMutation.isPending || challengeMutation.isPending}
            onClick={handleFillout}
          >
            {challengeMutation.isPending ? 'Creating challenge...' : 'Fill out for customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Intro;
