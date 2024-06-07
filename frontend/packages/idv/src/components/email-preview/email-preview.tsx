import { IcoEmail24 } from '@onefootprint/icons';
import { Box, LinkButton, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type EmailPreviewProps = {
  email?: string;
  onChange: () => void;
  textCta?: string;
};

const EmailPreview = ({ email, onChange, textCta }: EmailPreviewProps): JSX.Element | null =>
  email ? (
    <EmailCard>
      <EmailCardContent>
        <Box>
          <StyledIcoEmail24 />
        </Box>
        <Text variant="label-3" color="primary" isPrivate>
          {email}
        </Text>
      </EmailCardContent>
      <LinkButton onClick={onChange}>{textCta || 'Change'}</LinkButton>
    </EmailCard>
  ) : null;

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
