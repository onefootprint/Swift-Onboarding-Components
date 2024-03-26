import {
  AddressInput,
  DobInput,
  FirstNameInput,
  Form,
  LastNameInput,
  MiddleNameInput,
  SSN9Input,
  useFootprint,
} from '@onefootprint/components';
import React from 'react';

import useRequest from '../hooks/use-request';
import s from '../onboarding-components.module.css';

const CollectData = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();
  const saveMutation = useRequest(fp.save);

  const handleSubmit = () => {
    saveMutation.mutate({ onSuccess: onDone });
  };

  return (
    <div className={s.container}>
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Data</legend>
        <Form className={s.form} onSubmit={handleSubmit}>
          <FirstNameInput />
          <MiddleNameInput />
          <LastNameInput />
          <DobInput />
          <hr />
          <AddressInput className={s.form} />
          <hr />
          <SSN9Input />
          <button type="submit">
            {saveMutation.loading ? 'Loading...' : 'Save'}
          </button>
        </Form>
      </fieldset>
    </div>
  );
};

export default CollectData;
