import { HeaderTitle } from 'footprint-ui';
import { useTranslation } from 'hooks';
import React from 'react';
import NavigationHeader from 'src/components/navigation-header';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';

import EmailIdentificationForm from './components/email-identification-form';
import useEmailIdentify from './hooks/use-email-identify';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentification = () => {
  const { t } = useTranslation('pages.email-identification');
  const { identifyEmail, isLoading } = useEmailIdentify();

  const onSubmit = (formData: FormData) => {
    identifyEmail(formData.email);
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
        title={t('title')}
      />
      <EmailIdentificationForm onSubmit={onSubmit} isLoading={isLoading()} />
    </>
  );
};

export default EmailIdentification;
