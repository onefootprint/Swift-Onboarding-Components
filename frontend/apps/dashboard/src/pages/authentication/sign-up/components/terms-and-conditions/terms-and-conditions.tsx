import { Text } from '@onefootprint/ui';
import Link from 'next/link';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

const TermsAndConditions = () => (
  <TextContainer>
    <Text variant="caption-3" color="secondary">
      <Trans
        i18nKey="components.terms-and-conditions.text"
        components={{
          a1: <Link href="https://onefootprint.com/terms-of-service" target="_blank" rel="noopener noreferrer" />,
          a2: <Link href="https://onefootprint.com/privacy-policy" target="_blank" rel="noopener noreferrer" />,
        }}
      />
    </Text>
  </TextContainer>
);

const TextContainer = styled.div`
  ${({ theme }) => css`
    text-align: center;
    width: 350px;

    > * {
      display: inline;
      margin-right: ${theme.spacing[2]};
    }
  `}
`;

export default TermsAndConditions;
