import { useTranslation } from '@onefootprint/hooks';
import { IcoCopy16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import {
  Box,
  CopyButton,
  createFontStyles,
  Stack,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

import toReadableString from './utils/to-readable-string';

type HitFieldRowProps = {
  fieldName: string;
  fieldValue: string | string[];
};

const HitFieldRow = ({ fieldName, fieldValue }: HitFieldRowProps) => {
  const { t } = useTranslation(
    'pages.entity.risk-signals.details.matches.hits',
  );

  const renderMatchTypes = (matchTypes: string[]) =>
    matchTypes.map((str: string) => toReadableString(str)).join(', ');

  const renderLocationUrlValue = (url: string) => (
    <Stack align="center" justify="space-between">
      <SourceUrl>{url}</SourceUrl>
      <CopyButton
        ariaLabel={t('source-url.copy')}
        contentToCopy={url}
        tooltipPosition="bottom"
      >
        <IcoCopy16 />
      </CopyButton>
    </Stack>
  );

  const renderGeneralValue = (generalValue: string) => (
    <Typography
      variant="body-3"
      sx={{
        textAlign: 'right',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }}
    >
      {generalValue.charAt(0).toUpperCase() + generalValue.slice(1)}
    </Typography>
  );

  let valueElement;
  if (fieldName === 'matchTypes') {
    valueElement = renderMatchTypes(fieldValue as string[]);
  } else if (fieldName === 'locationurl' || fieldName === 'relatedUrl') {
    valueElement = renderLocationUrlValue(fieldValue as string);
  } else {
    valueElement = renderGeneralValue(fieldValue as string);
  }
  return (
    <Box
      key={fieldName}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      display="flex"
      gap={9}
    >
      <LabelContainer>
        <Typography
          variant="body-3"
          color="tertiary"
          sx={{ textAlign: 'left', width: 'fit-content' }}
        >
          {toReadableString(fieldName)}
        </Typography>
      </LabelContainer>
      <ValueContainer>{valueElement}</ValueContainer>
    </Box>
  );
};

const LabelContainer = styled.div`
  text-align: left;
  max-width: fit-content;
  flex: 1;
`;

const ValueContainer = styled.div`
  text-align: right;
  max-width: fit-content;
  flex: 1;
  overflow: hidden;
`;

const SourceUrl = styled.div`
  width: 90%;
  ${createFontStyles('body-3')};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export default HitFieldRow;
