import { Stack } from '@onefootprint/ui';
import noop from 'lodash/noop';
import type { ComponentProps } from 'react';

import EmailPreview from '../../../../../email-preview';
import PhoneForm from '../../../../../phone-form';
import type { HeaderProps } from '../../types';

type PhoneFormProps = ComponentProps<typeof PhoneForm>;
type PhonePageStructureProps = {
  countries: PhoneFormProps['options'];
  defaultPhone?: string;
  email?: string;
  Footer?: JSX.Element;
  Header: (props: HeaderProps) => JSX.Element;
  isLoading?: boolean;
  l10n?: PhoneFormProps['l10n'];
  onChangeEmailClick?: () => void;
  onSubmit: (phone: string) => void;
  phoneValidator: PhoneFormProps['validator'];
  texts: {
    headerTitle: string;
    headerSubtitle?: string;
    emailChangeCta?: string;
  } & PhoneFormProps['texts'];
};

const PhonePageStructure = ({
  countries,
  defaultPhone,
  email,
  Footer,
  Header,
  isLoading,
  l10n,
  onChangeEmailClick,
  onSubmit,
  phoneValidator,
  texts,
}: PhonePageStructureProps) => {
  const { headerTitle, headerSubtitle, emailChangeCta, ...phoneTexts } = texts;
  const handleFormSubmit = (formData: { phoneNumber: string }) => {
    onSubmit(formData.phoneNumber);
  };

  return (
    <Stack direction="column" gap={8}>
      <Header title={headerTitle} subtitle={headerSubtitle} />
      {email ? <EmailPreview email={email} onChange={onChangeEmailClick || noop} textCta={emailChangeCta} /> : null}
      <PhoneForm
        l10n={l10n}
        defaultPhone={defaultPhone}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
        options={countries}
        texts={phoneTexts}
        validator={phoneValidator}
      />
      {Footer}
    </Stack>
  );
};

export default PhonePageStructure;
