import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, Toggle, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import useOrgSession from 'src/hooks/use-org-session';

const Header = () => {
  const { t } = useTranslation('pages.developers');
  const { sandbox } = useOrgSession();

  return (
    <HeaderContainer>
      <Box>
        <Typography variant="heading-3" as="h2" sx={{ marginBottom: 2 }}>
          {t('header.title')}
        </Typography>
        <Typography
          variant="body-2"
          color={sandbox.isSandbox ? 'warning' : 'success'}
        >
          {sandbox.isSandbox
            ? t('header.subtitle.sandbox')
            : t('header.subtitle.live')}
        </Typography>
      </Box>
      <Box>
        <Tooltip
          disabled={sandbox.canToggle}
          text={t('header.toggle-sandbox.tooltip')}
          alignment="end"
          position="bottom"
        >
          <Toggle
            checked={sandbox.isSandbox}
            disabled={!sandbox.canToggle}
            label={t('header.toggle-sandbox.label')}
            onChange={sandbox.toggle}
          />
        </Tooltip>
      </Box>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[9]};
  `};
`;

export default Header;
