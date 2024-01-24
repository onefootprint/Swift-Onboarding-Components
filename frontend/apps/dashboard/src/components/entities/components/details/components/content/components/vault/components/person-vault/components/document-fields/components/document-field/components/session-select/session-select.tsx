import { useIntl } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { Document } from '@onefootprint/types';
import { Box, Select, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getDocumentVersion } from '../../../../utils';

export type SessionSelectProps = {
  documents: Document[];
  activeDocumentVersion: string;
  onActiveDocumentVersionChange: (version: string) => void;
};

const SessionSelect = ({
  documents,
  activeDocumentVersion,
  onActiveDocumentVersionChange,
}: SessionSelectProps) => {
  const { formatDateWithTime } = useIntl();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.session-selector',
  });
  // Hide the whole session selector if any of the sessions don't have a start date.
  // These aren't real sessions, just a series of images uploaded via API rather than via bifrost.
  const sessionsToRender = documents.filter(d => !!d.startedAt);
  if (!sessionsToRender.length) {
    return null;
  }
  const documentOptions = sessionsToRender.map((document, index) => ({
    label: `${t('session')} ${index + 1} (${formatDateWithTime(
      new Date(document.startedAt as string),
    )})`,
    value: getDocumentVersion(document, documents),
  }));

  const currentOption = documentOptions.find(
    option => option.value === activeDocumentVersion,
  );

  return (
    <SelectContainer>
      <Typography variant="label-2">{t('title')}</Typography>
      <Box width="250px">
        <Select
          onChange={newOption => onActiveDocumentVersionChange(newOption.value)}
          options={documentOptions}
          placeholder={currentOption?.label || ''}
          size="compact"
          value={currentOption}
        />
      </Box>
    </SelectContainer>
  );
};

const SelectContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    background-color: ${theme.backgroundColor.secondary};
    margin-top: -${theme.borderWidth[1]};
    border: ${theme.borderWidth[1]} ${theme.borderColor.tertiary} solid;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
  `};
`;

export default SessionSelect;
