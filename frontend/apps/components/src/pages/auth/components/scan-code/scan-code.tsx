import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator, Stack } from '@onefootprint/ui';
import React from 'react';

import type { HeaderProps } from '../../types';

type ScanCodeProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const ScanCode = ({ children, Header }: ScanCodeProps) => {
  const { t } = useTranslation('pages.auth');

  return (
    <>
      <Stack direction="column" gap={7}>
        <Header
          title={t('scan-code-to-log-in')}
          subtitle={t('use-camera-or-qr-reader')}
        />
        <CodePlaceholder>
          <LoadingIndicator />
        </CodePlaceholder>
      </Stack>
      {children}
    </>
  );
};

export default ScanCode;

const CodePlaceholder = styled.div`
  ${() => css`
    display: flex;
    justify-content: center;
    margin: 0 auto;
    width: 120px;
    height: 120px;
  `}
`;
