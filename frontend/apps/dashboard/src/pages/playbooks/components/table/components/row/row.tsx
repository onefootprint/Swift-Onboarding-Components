import { DEMO_BASE_URL } from '@onefootprint/global-constants';
import { useIntl, useTranslation } from '@onefootprint/hooks';
import { IcoArrowTopRight24 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import type { OnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types/src/data/onboarding-config';
import { Badge, CodeInline, LinkButton } from '@onefootprint/ui';
import React from 'react';
import useOrgSession from 'src/hooks/use-org-session';

import Actions from './components/actions';

export type RowProps = {
  playbook: OnboardingConfig;
};

const Row = ({ playbook }: RowProps) => {
  const { t } = useTranslation('pages.playbooks.table.row');
  const { formatDateWithTime } = useIntl();
  const { name, key, status, createdAt } = playbook;
  const { sandbox } = useOrgSession();

  return (
    <>
      <td>
        {sandbox.isSandbox ? (
          <IndicatorContainer>
            {status === 'enabled' ? (
              <LinkButton
                href={`${DEMO_BASE_URL}/preview?ob_key=${key}`}
                iconComponent={IcoArrowTopRight24}
                target="_blank"
                size="compact"
                onClick={event => event.stopPropagation()}
              >
                {name}
              </LinkButton>
            ) : (
              name
            )}
          </IndicatorContainer>
        ) : (
          name
        )}
      </td>
      <td>
        {playbook.kind === OnboardingConfigKind.kyc && t('type.kyc')}
        {playbook.kind === OnboardingConfigKind.kyb && t('type.kyb')}
        {playbook.kind === OnboardingConfigKind.auth && t('type.auth')}
      </td>
      <td>
        <CodeInline truncate>{key}</CodeInline>
      </td>
      <td>
        {status === 'enabled' && (
          <Badge variant="success">{t('status.enabled')}</Badge>
        )}
        {status === 'disabled' && (
          <Badge variant="error">{t('status.disabled')}</Badge>
        )}
      </td>
      <td>{formatDateWithTime(new Date(createdAt))}</td>
      <td>
        <Actions playbook={playbook} />
      </td>
    </>
  );
};

const IndicatorContainer = styled.div`
  position: relative;
  width: fit-content;
`;

export default Row;
