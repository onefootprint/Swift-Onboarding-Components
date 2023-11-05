import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { Button } from '@onefootprint/ui';
import React, { useRef } from 'react';
import { I18nextProvider } from 'react-i18next';

import configureI18next from '../../config/initializers/i18next';
import type { ImageConsentHandler } from '.';
import ImageConsent from '.';

type ConsentInfoType =
  | {
      consentLanguageText: string;
      mlConsent: boolean;
    }
  | undefined;

type ImageConsentWrapperProps = {
  onSubmit: (consentInfo: ConsentInfoType) => void;
};

const ImageConsentWrapper = ({ onSubmit }: ImageConsentWrapperProps) => {
  const consentRef = useRef<ImageConsentHandler>(null);
  return (
    <>
      <ImageConsent ref={consentRef} />
      <Button
        onClick={() => onSubmit(consentRef.current?.getConsentInfo())}
        testID="test-submit-button"
      >
        Button
      </Button>
    </>
  );
};

const renderImageConsent = (onSubmit: (consentInfo: ConsentInfoType) => void) =>
  customRender(
    <I18nextProvider i18n={configureI18next()}>
      <ImageConsentWrapper onSubmit={onSubmit} />
    </I18nextProvider>,
  );

describe('<ImageConsent/>', () => {
  it('Shows the ml consent true when optional checked', async () => {
    let submittedConsentInfo: Record<string, unknown> = {};
    const onConsentSubmit = (consentInfo: ConsentInfoType) => {
      submittedConsentInfo = { ...consentInfo };
    };
    renderImageConsent(onConsentSubmit);
    const optionalConsentCheckbox = screen.getByTestId(
      'third-party-consent',
    ) as HTMLInputElement;
    await userEvent.click(optionalConsentCheckbox);

    const button = screen.getByTestId('test-submit-button');
    await userEvent.click(button);
    expect(submittedConsentInfo.mlConsent).toBeTruthy();
  });

  it('Shows the ml consent false when optional not checked', async () => {
    let submittedConsentInfo: Record<string, unknown> = {};
    const onConsentSubmit = (consentInfo: ConsentInfoType) => {
      submittedConsentInfo = { ...consentInfo };
    };
    renderImageConsent(onConsentSubmit);

    const button = screen.getByTestId('test-submit-button');
    await userEvent.click(button);
    expect(submittedConsentInfo.mlConsent).toBeFalsy();
  });
});
