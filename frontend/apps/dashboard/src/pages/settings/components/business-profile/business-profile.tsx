import { useTranslation } from '@onefootprint/hooks';
import { Box, Divider, LinkButton, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled, { css } from 'styled-components';

const BusinessProfile = () => {
  const { t } = useTranslation('pages.settings.business-profile');
  const { data } = useSessionUser();

  // TODO: https://linear.app/footprint/issue/FP-1712/implement-editing-name-icon-and-address-on-business-profile-section
  const handleChangeLogo = () => {};
  const handleEditName = () => {};
  const handleEditAddress = () => {};

  return (
    <section data-testid="business-profile-section">
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
      </Header>
      <Box sx={{ marginY: 5 }}>
        <StyledDivider />
      </Box>
      <Container>
        <LogoContainer>
          <Logo>
            <Image
              alt={t('logo.alt')}
              height={20}
              width={20}
              // TODO: https://linear.app/footprint/issue/FP-1735/add-usetenant-hook-for-fetching-tenant-data
              // src={data?.tenant.logoUrl || ''}
              src="/404.png"
            />
          </Logo>
          <LinkButton onClick={handleChangeLogo} sx={{ marginLeft: 5 }}>
            {t('logo.change-logo')}
          </LinkButton>
        </LogoContainer>
        <ProfileContainer>
          <ProfileInfo>
            <Typography
              variant="label-3"
              color="tertiary"
              sx={{ marginBottom: 2 }}
            >
              {t('company.name')}
            </Typography>
            {/* TODO: https://linear.app/footprint/issue/FP-1735/add-usetenant-hook-for-fetching-tenant-data */}
            <Typography variant="body-3">{data?.tenantName}</Typography>
          </ProfileInfo>
          <LinkButton onClick={handleEditName}>{t('company.edit')}</LinkButton>
        </ProfileContainer>
        <ProfileContainer>
          <ProfileInfo>
            <Typography
              variant="label-3"
              color="tertiary"
              sx={{ marginBottom: 2 }}
            >
              {t('company.address')}
            </Typography>
            {/* TODO: https://linear.app/footprint/issue/FP-1735/add-usetenant-hook-for-fetching-tenant-data */}
            <Typography variant="label-3">158 West 23 Street</Typography>
            <Typography variant="body-3">New York, NY 10011 US</Typography>
          </ProfileInfo>
          <LinkButton onClick={handleEditAddress}>
            {t('company.edit')}
          </LinkButton>
        </ProfileContainer>
      </Container>
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]};
    justify-content: space-between;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    flex-direction: column;
    row-gap: ${theme.spacing[8]};
  `}
`;

const Logo = styled.div`
  ${({ theme }) => css`
    border-radius: 50%;
    width: 40px;
    height: 40px;
    border: 1px solid ${theme.borderColor.tertiary};
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const ProfileContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 350px;
`;

const ProfileInfo = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[8]};
  `}
`;

export default BusinessProfile;
