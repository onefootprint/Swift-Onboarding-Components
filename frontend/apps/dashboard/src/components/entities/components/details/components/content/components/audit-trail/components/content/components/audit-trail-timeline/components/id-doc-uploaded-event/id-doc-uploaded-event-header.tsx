import styled, { css } from '@onefootprint/styled';
import type { IdDocUploadedEventData } from '@onefootprint/types';
import { Tag, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

type IdDocUploadedEventHeaderProps = {
  data: IdDocUploadedEventData;
};

const IdDocUploadedEventHeader = ({ data }: IdDocUploadedEventHeaderProps) => {
  const { t } = useTranslation('common');

  return (
    <Container>
      <Typography variant="label-3">
        {t(
          `pages.entity.audit-trail.timeline.id-doc-uploaded-event.title.${data.status}` as ParseKeys<'common'>,
        )}
      </Typography>
      <Tag>{t(`id_document.${data.documentType}` as ParseKeys<'common'>)}</Tag>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  `}
`;

export default IdDocUploadedEventHeader;
