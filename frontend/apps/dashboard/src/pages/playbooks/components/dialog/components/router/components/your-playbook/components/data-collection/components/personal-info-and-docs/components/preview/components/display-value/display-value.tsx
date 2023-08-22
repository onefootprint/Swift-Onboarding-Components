import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { CollectedKycDataOption } from '@onefootprint/types';
import { Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';

import { PersonalInformationAndDocs } from '@/playbooks/utils/machine/types';

type DisplayValueProps = {
  field: keyof PersonalInformationAndDocs;
  personalInfoAndDocs: PersonalInformationAndDocs;
};

const DisplayValue = ({ field, personalInfoAndDocs }: DisplayValueProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.form.personal-info-and-docs',
  );

  const value = personalInfoAndDocs[field];

  if (field === CollectedKycDataOption.fullAddress) {
    return (
      <Typography variant="body-3">{t(`preview.address-display`)}</Typography>
    );
  }
  if (field === 'ssnKind') {
    return <Typography variant="body-3">{t(`preview.${value}`)}</Typography>;
  }
  if (field === 'idDocKind') {
    const { idDocKind } = personalInfoAndDocs;
    const remainingIdDocTypes = idDocKind.slice(2);
    const remainingDocString = remainingIdDocTypes
      .map(k => t(`preview.${k as string}`))
      .join(', ');
    if (idDocKind.length > 3) {
      return (
        <DocPreviewContainer>
          <Typography variant="body-3">
            {`${t(`preview.${idDocKind[0]}`)}, ${t(
              `preview.${idDocKind[1]}`,
            )}, ${t('preview.and')}`}
          </Typography>
          <Tooltip
            text={remainingDocString}
            alignment="center"
            position="bottom"
          >
            <Typography variant="body-3" sx={{ textDecoration: 'underline' }}>
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
  }
  if (typeof value === 'boolean') {
    if (value) {
      return <IcoCheck24 testID="check-icon" />;
    }
    return <IcoCloseSmall24 testID="close-icon" />;
  }

  return null;
};

export default DisplayValue;

const DocPreviewContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]};
    flex-wrap: nowrap;
  `}
`;
