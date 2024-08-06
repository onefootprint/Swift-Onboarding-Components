import { DEMO_BASE_URL } from '@onefootprint/global-constants';
import { useIntl } from '@onefootprint/hooks';
import { IcoArrowTopRight24 } from '@onefootprint/icons';
import type { OnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types/src/data/onboarding-config';
import { Badge, CodeInline, LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';
import styled from 'styled-components';

import Actions from './components/actions';

export type RowProps = {
  playbook: OnboardingConfig;
};

const Row = ({ playbook }: RowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.table.row',
  });
  const { formatDateWithTime } = useIntl();
  const { name, key, status, createdAt, kind } = playbook;
  const { sandbox } = useOrgSession();
  const canShowLink =
    kind === OnboardingConfigKind.kyc || kind === OnboardingConfigKind.kyb || kind === OnboardingConfigKind.document;

  return (
    <>
      <td>
        {sandbox.isSandbox ? (
          <IndicatorContainer>
            {status === 'enabled' && canShowLink ? (
              <LinkButton
                href={`${DEMO_BASE_URL}/preview?ob_key=${key}`}
                iconComponent={IcoArrowTopRight24}
                target="_blank"
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

const IndicatorContainer = styled.div`
  position: relative;
  width: fit-content;
`;

export default Row;
