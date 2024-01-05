import { useTranslation } from '@onefootprint/hooks';
import { IcoEmail16, IcoFaceid16, IcoSmartphone16 } from '@onefootprint/icons';
import type { ComponentProps } from 'react';
import React from 'react';

import MethodSelectComponent from './component';

type MethodSelectComponentProps = ComponentProps<typeof MethodSelectComponent>;
type MethodSelectProps = Pick<
  MethodSelectComponentProps,
  'children' | 'Header'
>;

const MethodSelect = ({ children, Header }: MethodSelectProps) => {
  const { t } = useTranslation('pages.auth');

  return (
    <MethodSelectComponent
      Header={Header}
      isLoading={false}
      methodOptions={[
        {
          IconComponent: IcoEmail16,
          title: `${t('send-code-to')} j••••••••@g•••.com`,
          value: 'Value1',
        },
        {
          IconComponent: IcoSmartphone16,
          title: `${t('send-code-to')} ••• ••02`,
          value: 'Value2',
        },
        {
          IconComponent: IcoFaceid16,
          title: t('passkey'),
          value: 'Value3',
        },
      ]}
      methodSelected="Value1"
      onMethodChange={() => undefined}
      texts={{
        cta: t('continue'),
        headerSubtitle: t('log-in-to-modify-details'),
        headerTitle: t('verify-identity'),
      }}
    >
      {children}
    </MethodSelectComponent>
  );
};

export default MethodSelect;
