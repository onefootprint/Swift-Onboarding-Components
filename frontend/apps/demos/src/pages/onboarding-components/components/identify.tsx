import {
  EmailInput,
  Form,
  PhoneInput,
  useFootprint,
} from '@onefootprint/components';
import React from 'react';

import useRequest from '../hooks/use-request';
import s from '../onboarding-components.module.css';

const Identify = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();
  const identifyMutation = useRequest(fp.identifyAndAuthenticate);

  const handleSubmit = async () => {
    identifyMutation.mutate({ onSuccess: onDone });
  };

  return (
    <div className={s.container}>
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Identification</legend>
        <Form onSubmit={handleSubmit} className={s.form}>
          <EmailInput name="email" />
          <PhoneInput name="phone" />
          <button type="submit">
            {identifyMutation.loading ? 'Loading...' : 'Submit'}
          </button>
        </Form>
      </fieldset>
    </div>
  );
};

export default Identify;
