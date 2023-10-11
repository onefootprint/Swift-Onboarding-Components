import { useTranslation } from '@onefootprint/hooks';
import { IcoEmail24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

export type EmailPreviewProps = {
  email?: string;
  onChange: () => void;
};

const EmailPreview = ({ email, onChange }: EmailPreviewProps) => {
  const { t } = useTranslation('pages.phone-identification');

  return email ? (
    <EmailCard>
      <EmailCardContent>
        <Box>
          <StyledIcoEmail24 />
        </Box>
        <Typography variant="label-3" color="primary" isPrivate>
          {email}
        </Typography>
      </EmailCardContent>
      <LinkButton size="compact" onClick={onChange}>
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

export default EmailPreview;
