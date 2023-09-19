import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { SupportedIdDocTypes } from '@onefootprint/types';
import { Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';

export type IdDocDisplayProps = {
  idDocKind: SupportedIdDocTypes[];
  threshold?: number;
};

const IdDocDisplay = ({ idDocKind, threshold = 3 }: IdDocDisplayProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.summary.form.personal-info-and-docs',
  );

  // this function only supports these options right now!
  // possibly will genericize further later
  const possibleThresholds = [2, 3];
  if (!possibleThresholds.includes(threshold)) {
    return null;
  }

  const remainingIdDocTypes = idDocKind.slice(threshold - 1);
  const remainingDocString = remainingIdDocTypes
    .map(k => t(`preview.${k as string}`))
    .join(', ');

  if (idDocKind.length > threshold) {
    const displayStringFirstTwo = `${t(`preview.${idDocKind[0]}`)}, ${t(
      `preview.${idDocKind[1]}`,
    )}, ${t('preview.and')}`;

    const displayStringFirst = `${t(`preview.${idDocKind[0]}`)} ${t(
      'preview.and',
    )}`;

    return (
      <DocPreviewContainer>
        <Typography variant="body-3" sx={{ whiteSpace: 'nowrap' }}>
          {threshold === 3 ? displayStringFirstTwo : displayStringFirst}
        </Typography>
        <Tooltip text={remainingDocString} alignment="center" position="bottom">
          <Typography
            variant="body-3"
            sx={{ textDecoration: 'underline', whiteSpace: 'nowrap' }}
          >
            {`${remainingIdDocTypes.length} ${t('preview.more')}`}
          </Typography>
        </Tooltip>
      </DocPreviewContainer>
    );
  }
  const possibleIdDocs = idDocKind
    .map(k => t(`preview.${k as string}`))
    .join(', ');
  return <Typography variant="body-3">{possibleIdDocs}</Typography>;
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
