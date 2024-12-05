import { useEffect, useState } from 'react';
import Header from '../components/header';
import Navigation from '../components/navigation';
import useFootprint from '../hooks/use-footprint';
import useRequest from '../hooks/use-request';

const AddressDataStep = ({ onboardingData, onGoBack, onSubmit }) => {
  const { save } = useFootprint();
  const { isLoading, error, makeRequest } = useRequest();

  const [formData, setFormData] = useState({
    country: onboardingData.country || 'US',
    addressLine1: onboardingData.addressLine1 || '',
    addressLine2: onboardingData.addressLine2 || '',
    city: onboardingData.city || '',
    state: onboardingData.state || 'NY',
    zipcode: onboardingData.zipcode || '',
  });

  const [validationErrors, setValidationErrors] = useState({
    country: '',
    addressLine1: '',
    city: '',
    state: '',
    zipcode: '',
    general: '',
  });

  const [states, setStates] = useState(countryStates[formData.country] || []);

  useEffect(() => {
    setStates(countryStates[formData.country] || []);
  }, [formData.country]);

  const handleInputChange = e => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value,
    }));
    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [id]: '',
      general: '',
    }));
  };

  const validateForm = () => {
    const errors = {
      country: formData.country ? '' : 'Country is required',
      addressLine1: formData.addressLine1 ? '' : 'Address Line 1 is required',
      city: formData.city ? '' : 'City is required',
      state: formData.state ? '' : 'State is required',
      zipcode: formData.zipcode ? '' : 'Zipcode is required',
      general: '',
    };
    setValidationErrors(errors);
    return Object.values(errors).every(error => error === '');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await makeRequest(async () => {
        await save({
          'id.country': formData.country,
          'id.address_line1': formData.addressLine1,
          'id.address_line2': formData.addressLine2,
          'id.city': formData.city,
          'id.state': formData.state,
          'id.zip': formData.zipcode,
        });
        onSubmit(formData);
      });
    } catch (error) {
      console.error('Error saving address data:', error);
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        general: 'An error occurred while saving. Please try again.',
      }));
    }
  };

  return (
    <div className="app-form address-data-step">
      <Navigation onClick={onGoBack} />
      <Header
        title="What's their residential address?"
        subtitle="We need to collect this information to verify their identity."
      />
      <form className="form" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="country">
                Country
              </label>
              <select className="form-input" id="country" value={formData.country} onChange={handleInputChange}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
              {validationErrors.country && <p className="form-error">{validationErrors.country}</p>}
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
                value={formData.addressLine1}
                onChange={handleInputChange}
              />
              {validationErrors.addressLine1 && <p className="form-error">{validationErrors.addressLine1}</p>}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="addressLine2">
                Address Line 2
              </label>
              <input
                className="form-input"
                id="addressLine2"
                placeholder="Apt 4B"
                value={formData.addressLine2}
                onChange={handleInputChange}
              />
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
                value={formData.city}
                onChange={handleInputChange}
              />
              {validationErrors.city && <p className="form-error">{validationErrors.city}</p>}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="state">
                State
              </label>
              <select className="form-input" id="state" value={formData.state} onChange={handleInputChange}>
                {states.map(state => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              {validationErrors.state && <p className="form-error">{validationErrors.state}</p>}
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
                value={formData.zipcode}
                onChange={handleInputChange}
              />
              {validationErrors.zipcode && <p className="form-error">{validationErrors.zipcode}</p>}
            </div>
          </div>
        </div>
        {error && <p className="form-error">{error}</p>}
        {validationErrors.general && <p className="form-error">{validationErrors.general}</p>}
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
