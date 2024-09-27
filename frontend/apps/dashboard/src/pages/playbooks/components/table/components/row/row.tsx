import { DEMO_BASE_URL } from '@onefootprint/global-constants';
import { useIntl } from '@onefootprint/hooks';
import type { OnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types/src/data/onboarding-config';
import { Badge, CodeInline, Text, createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';
import styled, { css } from 'styled-components';

import Actions from './components/actions';

export type RowProps = {
  playbook: OnboardingConfig;
};

const Row = ({ playbook }: RowProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'table.row',
  });
  const { formatDateWithTime } = useIntl();
  const { name, key, status, createdAt, kind } = playbook;
  const { sandbox } = useOrgSession();

  return (
    <>
      <td>
        {sandbox.isSandbox ? (
          <>
            {status === 'enabled' ? (
              <StyledLink
                href={`${DEMO_BASE_URL}/preview?kind=${kind}&ob_key=${key}`}
                target="_blank"
                onClick={event => event.stopPropagation()}
              >
                {name}
              </StyledLink>
            ) : (
              <Text variant="body-3" truncate>
                {name}
              </Text>
            )}
          </>
        ) : (
          name
        )}
      </td>
      <td>
        {playbook.kind === OnboardingConfigKind.kyc && t('type.kyc')}
        {playbook.kind === OnboardingConfigKind.kyb && t('type.kyb')}
        {playbook.kind === OnboardingConfigKind.auth && t('type.auth')}
        {playbook.kind === OnboardingConfigKind.document && t('type.document')}
      </td>
      <td>
        <CodeInline truncate>{key}</CodeInline>
      </td>
      <td>
        {status === 'enabled' && <Badge variant="success">{t('status.enabled')}</Badge>}
        {status === 'disabled' && <Badge variant="error">{t('status.disabled')}</Badge>}
      </td>
      <td>{formatDateWithTime(new Date(createdAt))}</td>
      <td aria-label="actions">
        <Actions playbook={playbook} />
      </td>
    </>
  );
};

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.accent};
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
  `};
`;

export default Row;
