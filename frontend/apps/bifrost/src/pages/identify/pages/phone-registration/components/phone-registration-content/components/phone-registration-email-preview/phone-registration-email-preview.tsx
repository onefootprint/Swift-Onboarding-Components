import { useTranslation } from '@onefootprint/hooks';
import { IcoEmail24 } from '@onefootprint/icons';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import useIdentifyMachine, { Events } from 'src/hooks/use-identify-machine';
import styled, { css } from 'styled-components';

const PhoneRegistrationEmailPreview = () => {
  const { t } = useTranslation('pages.phone-registration');
  const [state, send] = useIdentifyMachine();
  const { email } = state.context;

  const handleChangeEmail = () => {
    send({ type: Events.emailChangeRequested });
  };

  return email ? (
    <EmailCard>
      <EmailCardContent>
        <Box>
          <StyledIcoEmail24 />
        </Box>
        <Typography variant="label-3" color="primary" data-private>
          {email}
        </Typography>
      </EmailCardContent>
      <LinkButton size="compact" onClick={handleChangeEmail}>
        {t('email-card.cta')}
      </LinkButton>
    </EmailCard>
  ) : null;
};

const EmailCard = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[8]};
    padding: ${theme.spacing[5]};

    p {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `}
`;

const EmailCardContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
`;

const StyledIcoEmail24 = styled(IcoEmail24)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[4]};
    position: relative;
    top: ${theme.spacing[1]};
  `}
`;

export default PhoneRegistrationEmailPreview;
