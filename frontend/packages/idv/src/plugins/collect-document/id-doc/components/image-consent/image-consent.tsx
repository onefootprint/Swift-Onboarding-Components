import { Checkbox, Divider, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../components/layout/components/header-title';

export type ImageConsentHandler = {
  getConsentInfo: () => { consentLanguageText: string; mlConsent: boolean };
};

const ImageConsent = forwardRef<ImageConsentHandler, {}>((_props, ref) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.components.image-consent',
  });
  const [isThirdPartyConsented, setIsThirdPartyConsented] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      getConsentInfo: () => {
        const descriptionWithoutHyperlinks = String(t('description')).replace(
          /<\/?privacy>|<\/?toc>|<\/?incode_privacy>|<br\/>/g,
          '',
        );
        const consentLanguages = [t('subtitle'), descriptionWithoutHyperlinks];

        if (isThirdPartyConsented) {
          consentLanguages.push(t('third-party-consent'));
        }
        consentLanguages.push(t('cta'));

        const consentLanguageText = consentLanguages.join('. ');
        return { consentLanguageText, mlConsent: isThirdPartyConsented };
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isThirdPartyConsented],
  );

  const handleThirdPartyConsent = () => {
    setIsThirdPartyConsented(prev => !prev);
  };

  const linkStyle = { textDecoration: 'underline', color: '#2D2D2D' };

  return (
    <>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Text variant="body-3" color="secondary" marginBottom={5} marginTop={7}>
        <Trans
          ns="idv"
          i18nKey="document-flow.id-doc.components.image-consent.description"
          components={{
            privacy: (
              <Link
                href="https://www.onefootprint.com/privacy-policy"
                rel="noopener noreferrer"
                target="_blank"
                style={linkStyle}
              />
            ),
            toc: (
              <Link
                href="https://www.onefootprint.com/terms-of-service"
                rel="noopener noreferrer"
                target="_blank"
                style={linkStyle}
              />
            ),
            incode_privacy: (
              <Link
                href="https://incode.com/privacy-policy/"
                rel="noopener noreferrer"
                target="_blank"
                style={linkStyle}
              />
            ),
          }}
        />
      </Text>
      <Divider />
      <ThirdPartyConsent>
        <Checkbox
          onChange={handleThirdPartyConsent}
          id="third-party-consent"
          testID="third-party-consent"
          checked={isThirdPartyConsented}
        />
        <LabelContainer onClick={handleThirdPartyConsent}>
          <Text variant="body-3" color="secondary">
            {t('third-party-consent')}
          </Text>
        </LabelContainer>
      </ThirdPartyConsent>
    </>
  );
});

const ThirdPartyConsent = styled.div`
  ${({ theme }) => css`
    display: flex;
    margin-left: calc(-1 * ${theme.spacing[5]});
    margin-right: calc(-1 * ${theme.spacing[5]});
    width: calc(100% + ${theme.spacing[8]});
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[4]};
  `}
`;

const LabelContainer = styled.div``;

export default ImageConsent;
