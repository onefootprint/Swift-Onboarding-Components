import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Header from '../components/header';
import useFootprint from '../hooks/use-footprint';

type FormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
};

const BasicDataStep = ({ onboardingData, onSubmit }) => {
  const { save } = useFootprint();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: onboardingData.firstName || '',
      middleName: onboardingData.middleName || '',
      lastName: onboardingData.lastName || '',
      dob: onboardingData.dob || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      await save({
        'id.first_name': data.firstName,
        'id.middle_name': data.middleName,
        'id.last_name': data.lastName,
        'id.dob': data.dob,
      });
      return data;
    },
    onSuccess: data => {
      onSubmit(data);
    },
  });

  const onSubmitForm = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="app-form basic-data-step">
      <Header title="Basic data" subtitle="We're legally required to collect this information." />
      <form className="form" onSubmit={handleSubmit(onSubmitForm)}>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="firstName">
                First name *
              </label>
              <input
                className="form-input"
                id="firstName"
                placeholder="Jane"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
            </div>
          </div>
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="middleName">
                Middle name
              </label>
              <input className="form-input" id="middleName" placeholder="Sue" {...register('middleName')} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="lastName">
                Last name *
              </label>
              <input
                className="form-input"
                id="lastName"
                placeholder="Doe"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="dob">
                Date of birth *
              </label>
              <input
                className="form-input"
                id="dob"
                placeholder="MM/DD/YYYY"
                {...register('dob', { required: 'Date of birth is required' })}
              />
              {errors.dob && <p className="form-error">{errors.dob.message}</p>}
            </div>
          </div>
        </div>
        {mutation.error && <p className="form-error">{mutation.error.message}</p>}
        <button type="submit" className="button button-primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default BasicDataStep;
