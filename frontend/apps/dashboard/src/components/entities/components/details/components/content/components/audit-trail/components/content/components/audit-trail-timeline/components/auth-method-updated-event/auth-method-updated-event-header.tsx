import type { AuthMethodUpdatedData } from '@onefootprint/types/src/data/timeline';
import { createFontStyles, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type AuthMethodUpdatedEventHeaderProps = {
  data: AuthMethodUpdatedData;
};

const AuthMethodUpdatedEventHeader = ({
  data,
}: AuthMethodUpdatedEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.auth-method-updated',
  });
  const { action, kind } = data;
  const actionLabel = t(action as string as ParseKeys<'common'>);

  return (
    <Typography variant="body-3" color="tertiary">
      <Trans
        i18nKey={actionLabel}
        components={{
          b: <Bold />,
        }}
        values={{
          kind: t(`method.${kind}`),
        }}
      />
    </Typography>
  );
};

const Bold = styled.b`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
  `}
`;

export default AuthMethodUpdatedEventHeader;
