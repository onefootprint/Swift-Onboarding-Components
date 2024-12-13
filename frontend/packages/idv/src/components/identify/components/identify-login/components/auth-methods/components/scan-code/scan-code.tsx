import { LoadingSpinner, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { HeaderProps } from '../../../../types';

type ScanCodeProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const ScanCode = ({ children, Header }: ScanCodeProps) => {
  const { t } = useTranslation('identify');

  return (
    <>
      <Stack direction="column" gap={7}>
        <Header title={t('scan-code-to-log-in')} subtitle={t('use-camera-or-qr-reader')} />
        <CodePlaceholder>
          <LoadingSpinner />
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
