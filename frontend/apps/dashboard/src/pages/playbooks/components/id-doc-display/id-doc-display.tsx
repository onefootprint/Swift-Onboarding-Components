// TODO: Deprecate this file

import { Color } from '@onefootprint/design-tokens';
import { IcoCloseSmall24 } from '@onefootprint/icons';
import type { SupportedIdDocTypes } from '@onefootprint/types';
import { Text, Tooltip } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type IdDocDisplayProps = {
  textColor?: Color;
  idDocKind: SupportedIdDocTypes[];
  threshold?: number;
};

const IdDocDisplay = ({ idDocKind, threshold = 3, textColor = 'primary' }: IdDocDisplayProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks.collected-data' });

  if (idDocKind.length === 0) {
    return <IcoCloseSmall24 />;
  }

  // this function only supports these options right now!
  // possibly will genericize further later
  const possibleThresholds = [2, 3];
  if (!possibleThresholds.includes(threshold)) {
    return null;
  }

  const remainingIdDocTypes = idDocKind.slice(threshold - 1);
  const remainingDocString = remainingIdDocTypes
    .map(k => t(`${kebabCase(k as string)}` as ParseKeys<'common'>))
    .join(', ');

  if (idDocKind.length > threshold) {
    const displayStringFirstTwo = `${t(
      `${kebabCase(idDocKind[0])}` as ParseKeys<'common'>,
    )}, ${t(`${kebabCase(idDocKind[1])}` as ParseKeys<'common'>)}, ${t('and')}`;

    const displayStringFirst = `${t(`${kebabCase(idDocKind[0])}` as ParseKeys<'common'>)} ${t('and')}`;

    return (
      <DocPreviewContainer>
        <Text variant="body-3" whiteSpace="nowrap" color={textColor}>
          {threshold === 3 ? displayStringFirstTwo : displayStringFirst}
        </Text>
        <Tooltip text={remainingDocString} alignment="center" position="bottom">
          <Text variant="body-3" textDecoration="underline" whiteSpace="nowrap" color={textColor}>
            {`${remainingIdDocTypes.length} ${t('more')}`}
          </Text>
        </Tooltip>
      </DocPreviewContainer>
    );
  }

  const possibleIdDocs = idDocKind.map(k => t(`${kebabCase(k as string)}` as ParseKeys<'common'>)).join(', ');
  return (
    <Text variant="body-3" color={textColor}>
      {possibleIdDocs}
    </Text>
  );
};

const DocPreviewContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]};
    flex-wrap: nowrap;
    align-items: center;
  `}
`;

export default IdDocDisplay;
