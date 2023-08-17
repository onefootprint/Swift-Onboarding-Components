import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

const InvestorProfile = () => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.data-collection.investor-profile',
  );
  const [added, setAdded] = useState(false);
  const handleClick = () => setAdded(!added);

  return (
    <Container>
      <Header>
        <Typography variant="label-3">{t('title')}</Typography>
        <input
          aria-hidden="true"
          checked={added}
          name="investorProfile"
          onChange={handleClick}
          aria-checked={added}
          role="switch"
          type="hidden"
        />
        {added ? (
          <LinkButton
            iconComponent={IcoTrash16}
            iconPosition="left"
            variant="destructive"
            onClick={handleClick}
          >
            {t('toggle.remove')}
          </LinkButton>
        ) : (
          <LinkButton
            iconComponent={IcoPlusSmall16}
            iconPosition="left"
            onClick={handleClick}
          >
            {t('toggle.add')}
          </LinkButton>
        )}
      </Header>
      <Typography variant="body-3">{t('subtitle')}</Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
  `};
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default InvestorProfile;
