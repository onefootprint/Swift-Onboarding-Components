import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Header from '../components/header';
import Navigation from '../components/navigation';
import useFootprint from '../hooks/use-footprint';

type FormData = {
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
};

const AddressDataStep = ({ onboardingData, onGoBack, onSubmit }) => {
  const { save } = useFootprint();
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      country: onboardingData.country || 'US',
      addressLine1: onboardingData.addressLine1 || '',
      addressLine2: onboardingData.addressLine2 || '',
      city: onboardingData.city || '',
      state: onboardingData.state || 'NY',
      zipcode: onboardingData.zipcode || '',
    },
  });

  const {
    mutate,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: async (data: FormData) => {
      await save({
        'id.country': data.country,
        'id.address_line1': data.addressLine1,
        'id.address_line2': data.addressLine2,
        'id.city': data.city,
        'id.state': data.state,
        'id.zip': data.zipcode,
      });
      return data;
    },
  });

  const selectedCountry = watch('country');
  const states = countryStates[selectedCountry] || [];

  const onSubmitForm = (data: FormData) => {
    try {
      mutate(data, {
        onSuccess: data => {
          onSubmit(data);
        },
      });
    } catch (error) {
      console.error('Error saving address data:', error);
    }
  };

  return (
    <div className="app-form address-data-step">
      <Navigation onClick={onGoBack} />
      <Header
        title="What's their residential address?"
        subtitle="We need to collect this information to verify their identity."
      />
      <form className="form" onSubmit={handleFormSubmit(onSubmitForm)}>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="country">
                Country
              </label>
              <select className="form-input" id="country" {...register('country', { required: 'Country is required' })}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
              {errors.country && <p className="form-error">{errors.country.message}</p>}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="addressLine1">
                Address Line 1
              </label>
              <input
                className="form-input"
                id="addressLine1"
                placeholder="123 Main St"
                {...register('addressLine1', { required: 'Address Line 1 is required' })}
              />
              {errors.addressLine1 && <p className="form-error">{errors.addressLine1.message}</p>}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="addressLine2">
                Address Line 2
              </label>
              <input className="form-input" id="addressLine2" placeholder="Apt 4B" {...register('addressLine2')} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="city">
                City
              </label>
              <input
                className="form-input"
                id="city"
                placeholder="New York"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && <p className="form-error">{errors.city.message}</p>}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="state">
                State
              </label>
              <select className="form-input" id="state" {...register('state', { required: 'State is required' })}>
                {states.map(state => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              {errors.state && <p className="form-error">{errors.state.message}</p>}
            </div>
          </div>
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="zipcode">
                Zipcode
              </label>
              <input
                className="form-input"
                id="zipcode"
                placeholder="10001"
                {...register('zipcode', { required: 'Zipcode is required' })}
              />
              {errors.zipcode && <p className="form-error">{errors.zipcode.message}</p>}
            </div>
          </div>
        </div>
        {error && <p className="form-error">{error.message}</p>}
        <button type="submit" className="button button-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

const countryStates = {
  US: [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ],
  CA: [
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'YT', label: 'Yukon' },
  ],
};

export default AddressDataStep;
