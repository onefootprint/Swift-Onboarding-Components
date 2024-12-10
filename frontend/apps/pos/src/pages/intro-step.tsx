import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import useFootprint from '../hooks/use-footprint';
import logo from '../images/avis.png';

const Intro = ({ onFillout }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
  } = useForm();
  const { createChallenge } = useFootprint();
  const phoneNumber = useWatch({ control, name: 'phoneNumber' });
  const mutation = useMutation({
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
    mutation.mutate(data);
  };

  return (
    <div className="app-form intro-step">
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
          {mutation.error && <p className="form-error">{mutation.error.message}</p>}
          {mutation.error && <p className="form-error">{mutation.error.message}</p>}
        </div>
        <div className="form-button">
          <button type="submit" className="button button-primary" disabled={mutation.isPending || mutation.isPending}>
            {mutation.isPending ? 'Verifying...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Intro;
