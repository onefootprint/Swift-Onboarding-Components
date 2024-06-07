'use client';

import { ThemedLogoFpDefault } from '@onefootprint/icons';
import { Stack, Text, Tooltip, createFontStyles, useToast } from '@onefootprint/ui';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { createAuthCookie } from '@/app/actions';
import { DEFAULT_PRIVATE_ROUTE } from '@/config/constants';
import { alertError } from '@/helpers';
import { useClientStore } from '@/hooks';
import { postPartnerAuthAssumeRole } from '@/queries';

import getUserPayload from '../get-user-payload';

type PartnerOrganization = {
  allowDomainAccess: boolean;
  domains: Array<string>;
  id: string;
  isAuthMethodSupported?: boolean;
  isDomainAlreadyClaimed?: boolean;
  logoUrl?: string;
  name: string;
  websiteUrl?: string;
};

const OrganizationsPageContent = ({
  token,
  orgs,
}: {
  token: string;
  orgs: PartnerOrganization[];
}) => {
  const router = useRouter();
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const toast = useToast();
  const errorToast = alertError(t, toast.show);
  const { update } = useClientStore(x => x);

  const handleClick = (tenantId: string) => () => {
    postPartnerAuthAssumeRole(token, tenantId)
      .then(res => {
        update({
          auth: res.token,
          user: res.user ? getUserPayload(res.user) : undefined,
        });
        createAuthCookie(res.token).then(() => {
          router.push(DEFAULT_PRIVATE_ROUTE);
        });
      })
      .catch(errorToast);
  };

  return (
    <Container>
      <ThemedLogoFpDefault />
      <Text variant="label-1" color="primary">
        {t('select-an-organization')}
      </Text>
      <ButtonGroup>
        {orgs.map(org => (
          <Tooltip
            key={org.id}
            text={t('disabled-org-selection', { org: org.name })}
            position="right"
            disabled={org.isAuthMethodSupported}
          >
            <EllipsisButton disabled={!org.isAuthMethodSupported} onClick={handleClick(org.id)} type="button">
              {org.name}
            </EllipsisButton>
          </Tooltip>
        ))}
      </ButtonGroup>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 320px;
    max-width: 95%;
    text-align: center;
    gap: ${theme.spacing[7]};
  `}
`;

const ButtonGroup = styled.div<{ isLoading?: boolean }>`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    width: 100%;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    & > div {
      width: 100%;

      &:not(:last-child) {
        border-bottom: ${theme.borderWidth[1]} solid
          ${theme.borderColor.tertiary};
      }
    }
  `}
`;

const EllipsisButton = styled.button`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('label-2')};
    background-color: ${theme.backgroundColor.primary};
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    width: 100%;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover,
    &:focus {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

export default OrganizationsPageContent;
