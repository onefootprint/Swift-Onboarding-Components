import { AuthMethodAction, AuthMethodKind } from '@onefootprint/types';
import type { AuthMethodUpdatedData } from '@onefootprint/types/src/data/timeline';
import { Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InsightEventPopover from 'src/components/insight-event-popover';
import styled, { css } from 'styled-components';

type AuthMethodUpdatedEventHeaderProps = {
  data: AuthMethodUpdatedData;
};

const AuthMethodUpdatedEventHeader = ({ data }: AuthMethodUpdatedEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.auth-method-updated',
  });

  const getActionLabel = (action: AuthMethodAction) => {
    if (action === AuthMethodAction.add_primary) {
      return t('pages.entity.audit-trail.timeline.auth-method-updated.action.add_primary');
    }
    return t('pages.entity.audit-trail.timeline.auth-method-updated.action.replace');
  };

  const getKindLabel = (kind: AuthMethodKind) => {
    if (kind === AuthMethodKind.phone) {
      return t('kind.phone');
    }
    if (kind === AuthMethodKind.email) {
      return t('kind.email');
    }
    return t('kind.passkey');
  };

  return (
    <>
      <InsightEventPopover insightEvent={data.insightEvent}>{t('user')}</InsightEventPopover>
      <Text variant="body-3" color="tertiary">
        <Trans
          i18nKey={getActionLabel(data.action)}
          components={{
            b: <Bold />,
          }}
          values={{
            kind: getKindLabel(data.kind),
          }}
        />
      </Text>
    </>
  );
};

const Bold = styled.b`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
  `}
`;

export default AuthMethodUpdatedEventHeader;
