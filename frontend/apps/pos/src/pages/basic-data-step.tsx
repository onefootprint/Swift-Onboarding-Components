import { useState } from 'react';
import Header from '../components/header';
import useFootprint from '../hooks/use-footprint';
import useRequest from '../hooks/use-request';

const BasicDataStep = ({ onboardingData, onSubmit }) => {
  const { save } = useFootprint();
  const { isLoading, error, makeRequest } = useRequest();
  const [formData, setFormData] = useState({
    firstName: onboardingData.firstName || '',
    middleName: onboardingData.middleName || '',
    lastName: onboardingData.lastName || '',
    dob: onboardingData.dob || '',
  });

  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    general: '',
  });

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
      firstName: formData.firstName ? '' : 'First name is required',
      lastName: formData.lastName ? '' : 'Last name is required',
      dob: formData.dob ? '' : 'Date of birth is required',
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
          'id.first_name': formData.firstName,
          'id.middle_name': formData.middleName,
          'id.last_name': formData.lastName,
          'id.dob': formData.dob,
        });
        onSubmit(formData);
      });
    } catch (_) {
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        general: 'An error occurred while saving the data. Please try again.',
      }));
    }
  };

  return (
    <div className="app-form basic-data-step">
      <Header title="Basic data" subtitle="We're legally required to collect this information." />
      <form className="form" onSubmit={handleSubmit}>
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
                value={formData.firstName}
                onChange={handleInputChange}
              />
              {validationErrors.firstName && <p className="form-error">{validationErrors.firstName}</p>}
            </div>
          </div>
          <div className="col">
            <div className="form-field">
              <label className="form-label" htmlFor="middleName">
                Middle name
              </label>
              <input
                className="form-input"
                id="middleName"
                placeholder="Sue"
                value={formData.middleName}
                onChange={handleInputChange}
              />
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
                value={formData.lastName}
                onChange={handleInputChange}
              />
              {validationErrors.lastName && <p className="form-error">{validationErrors.lastName}</p>}
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
                value={formData.dob}
                onChange={handleInputChange}
              />
              {validationErrors.dob && <p className="form-error">{validationErrors.dob}</p>}
            </div>
          </div>
        </div>
        {validationErrors.general && <p className="form-error">{validationErrors.general}</p>}
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="button button-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default BasicDataStep;
