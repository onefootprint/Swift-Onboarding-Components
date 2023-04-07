import { useTranslation } from '@onefootprint/hooks';
import { IdDocUploadedEventData } from '@onefootprint/types';
import { Tag, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type IdDocUploadedEventHeaderProps = {
  data: IdDocUploadedEventData;
};

const IdDocUploadedEventHeader = ({ data }: IdDocUploadedEventHeaderProps) => {
  const { t, allT } = useTranslation(
    'pages.entity.audit-trail.timeline.id-doc-uploaded-event',
  );

  // TODO: Once we receive the dataIdentifier from the backend, we can use and we won't need to append the prefix anymore`
  // https://linear.app/footprint/issue/FP-3246/return-dataidentifier-for-timeline-iddoc-document-uploaded?noRedirect=1
  return (
    <Container>
      <Typography variant="label-3">{t('title')}</Typography>
      <Tag>{allT(`di.id_document.${data.documentType}`)}</Tag>
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
