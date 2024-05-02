'use client';

import { ThemedLogoFpDefault } from '@onefootprint/icons';
import { createFontStyles, Text, Tooltip, useToast } from '@onefootprint/ui';
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
      <Inner>
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
              <EllipsisButton
                disabled={!org.isAuthMethodSupported}
                onClick={handleClick(org.id)}
                type="button"
              >
                {org.name}
              </EllipsisButton>
            </Tooltip>
          ))}
        </ButtonGroup>
      </Inner>
    </Container>
  );
};

const ButtonGroup = styled.div<{ isLoading?: boolean }>`
  ${({ theme, isLoading = false }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;

    span {
      height: 46px;
      margin: 0;
      width: 100%;
      padding: 0 ${theme.spacing[6]};
      co-align: left;

      &:not(:last-child) {
        button {
          border-bottom: unset;
        }
      }

      &:first-child {
        button {
          border-top-left-radius: ${theme.borderRadius.default};
          border-top-right-radius: ${theme.borderRadius.default};
        }
      }

      &:last-child {
        button {
          border-bottom-left-radius: ${theme.borderRadius.default};
          border-bottom-right-radius: ${theme.borderRadius.default};
        }
      }
    }

    button {
      ${createFontStyles('label-2')};
      background-color: ${theme.backgroundColor.primary};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      cursor: pointer;
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0 ${theme.spacing[6]};
      text-align: left;
      overflow: hidden;

      ${!isLoading &&
      css`
        @media (hover: hover) {
          &:hover {
            background-color: ${theme.backgroundColor.secondary};
          }
        }
        &:focus {
          background-color: ${theme.backgroundColor.secondary};
        }
      `}
    }
  `}
`;

const EllipsisButton = styled.button`
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  text-align: center;
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    max-width: 350px;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    align-items: center;
  `}
`;

export default OrganizationsPageContent;
