import {
  EmailInput,
  Form,
  PhoneInput,
  useFootprint,
} from '@onefootprint/elements';
import React from 'react';

import s from '../onboarding-components.module.css';

const Identify = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();

  const handleSubmit = async () => {
    fp.launchIdentify({ onDone });
  };

  return (
    <div className={s.container}>
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Identification</legend>
        <Form onSubmit={handleSubmit} className={s.form}>
          <EmailInput name="email" />
          <PhoneInput name="phone" />
          <button type="submit">Submit</button>
        </Form>
      </fieldset>
    </div>
  );
};

export default Identify;
