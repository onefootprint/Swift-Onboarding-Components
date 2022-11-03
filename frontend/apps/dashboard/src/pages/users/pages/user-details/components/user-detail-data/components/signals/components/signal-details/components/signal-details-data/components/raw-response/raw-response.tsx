import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import { Box, CodeBlock, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

type RawResponseProps = {
  rawResponse: string;
};

const RawResponse = ({ rawResponse }: RawResponseProps) => {
  const [animate] = useAutoAnimate<HTMLDivElement>();
  const [visible, setVisibility] = useState(true);
  const { t } = useTranslation(
    'pages.user-details.signals.details.raw-response',
  );

  const handleShow = () => {
    setVisibility(true);
  };

  const handleHide = () => {
    setVisibility(false);
  };

  return (
    <section>
      <Header>
        <Typography variant="label-2" as="h3">
          {t('title')}
        </Typography>
        {visible ? (
          <LinkButton size="compact" onClick={handleHide}>
            {t('hide')}
          </LinkButton>
        ) : (
          <LinkButton size="compact" onClick={handleShow}>
            {t('show')}
          </LinkButton>
        )}
      </Header>
      <Box ref={animate}>
        {visible && (
          <CodeBlock language="json" testID="raw-response-json">
            {rawResponse}
          </CodeBlock>
        )}
      </Box>
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default RawResponse;
