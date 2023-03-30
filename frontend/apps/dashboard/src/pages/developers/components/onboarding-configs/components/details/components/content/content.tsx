import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import isKybOnboardingConfig from '../../../../utils/is-kyb-onboarding-config';
import Edit from './components/edit';
import { FormData } from './components/form-data.types';
import KybBoDataCollection from './components/kyb-bo-data-collection';
import KybDataCollection from './components/kyb-data-collection';
import KycDataCollection from './components/kyc-data-collection';
import Name from './components/name';
import NameForm from './components/name-form';
import OnboardingDetails from './components/onboarding-details';

type ContentProps = {
  onboardingConfig: OnboardingConfig;
};

type FormProps = {
  id: string;
  onSubmit: (values: FormData) => void;
  defaultValues: FormData;
};

type ComponentProps = {
  onboardingConfig: OnboardingConfig;
};

type Section = {
  key: string;
  title?: string;
  Component: ({ onboardingConfig }: ComponentProps) => JSX.Element;
  Form?: ({ id, onSubmit, defaultValues }: FormProps) => JSX.Element;
};

const Content = ({ onboardingConfig }: ContentProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs-new.details',
  );

  const sections: Section[] = [
    {
      key: 'name',
      Component: Name,
      Form: NameForm,
    },
    {
      key: 'details',
      Component: OnboardingDetails,
    },
  ];

  if (isKybOnboardingConfig(onboardingConfig)) {
    sections.push({
      title: t('kyb-data-collection.title'),
      key: 'kyb',
      Component: KybDataCollection,
    });
    sections.push({
      title: t('kyb-bo-data-collection.title'),
      key: 'kyb-bo',
      Component: KybBoDataCollection,
    });
  } else {
    sections.push({
      key: 'kyc',
      Component: KycDataCollection,
    });
  }

  return (
    <Box testID="onboarding-configs-details-content">
      {sections.map(({ Form, Component, key, title }) => (
        <Edit
          onboardingConfig={onboardingConfig}
          Form={Form}
          title={title}
          key={key}
        >
          <Component onboardingConfig={onboardingConfig} />
        </Edit>
      ))}
    </Box>
  );
};

export default Content;
