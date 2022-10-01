import { useTranslation } from '@onefootprint/hooks';
import { AccessLog } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import FieldTagList from '../field-tag-list';

type AccessLogHeaderProps = {
  accessLog: AccessLog;
};

const AccessLogHeader = ({ accessLog }: AccessLogHeaderProps) => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.access-logs.timeline.log',
  );
  return (
    <Container>
      <Typography variant="body-3">
        <FieldTagList targets={accessLog.targets} />{' '}
        {accessLog.targets.length > 1
          ? t('plural-kinds-accessed-by')
          : t('singular-kind-accessed-by')}{' '}
        <Typography variant="label-3" as="span">
          {accessLog.principal || t('default-principle')}
        </Typography>
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  overflow-wrap: break-word;
  line-height: 26px;
`;

export default AccessLogHeader;
