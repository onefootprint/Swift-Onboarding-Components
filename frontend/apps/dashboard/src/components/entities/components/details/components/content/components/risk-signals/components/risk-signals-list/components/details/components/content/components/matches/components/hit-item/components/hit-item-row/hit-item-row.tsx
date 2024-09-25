import { IcoCopy16 } from '@onefootprint/icons';
import type { AmlHitMedia } from '@onefootprint/types';
import { Box, CopyButton, LinkButton, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import toReadableString from './utils/to-readable-string';

type HitItemRowProps = {
  fieldName: string;
  fieldValue: string | string[] | AmlHitMedia[] | number;
  handleShowAllFields: () => void;
  handleShowAmlMedia: (media: AmlHitMedia[]) => void;
};

const HitItemRow = ({ fieldName, fieldValue, handleShowAllFields, handleShowAmlMedia }: HitItemRowProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'risk-signals.details.matches.hits',
  });

  const renderMatchTypes = (matchTypes: string[]) => matchTypes.map((str: string) => toReadableString(str)).join(', ');

  const renderLocationUrlValue = (url: string) => (
    <Stack align="center" justify="space-between">
      <Url>{url}</Url>
      <CopyButton ariaLabel={t('copy')} contentToCopy={url} tooltip={{ position: 'bottom' }}>
        <IcoCopy16 />
      </CopyButton>
    </Stack>
  );

  const renderGeneralValue = (generalValue: string) => (
    <Text variant="body-3" truncate textAlign="right">
      {generalValue.charAt(0).toUpperCase() + generalValue.slice(1)}
    </Text>
  );

  const renderShowAllValue = () => <LinkButton onClick={handleShowAllFields}>{t('show-all.value')}</LinkButton>;

  const renderMediaValue = (media: AmlHitMedia[]) => (
    <LinkButton onClick={() => handleShowAmlMedia(media)}>{t('media')}</LinkButton>
  );

  let valueElement;
  if (fieldName === 'matchTypes') {
    valueElement = renderMatchTypes(fieldValue as string[]);
  } else if (fieldName === 'locationurl' || fieldName === 'relatedUrl') {
    valueElement = renderLocationUrlValue(fieldValue as string);
  } else if (fieldName === 'showAll') {
    valueElement = renderShowAllValue();
  } else if (fieldName === 'relevantMedia') {
    valueElement = renderMediaValue(fieldValue as AmlHitMedia[]);
  } else {
    valueElement = renderGeneralValue(fieldValue as string);
  }

  const labelText =
    fieldName === 'showAll' ? t('show-all.label', { count: fieldValue as number }) : toReadableString(fieldName);
  return (
    <Box alignItems="center" justifyContent="space-between" display="flex" gap={9} role="group" aria-label={fieldName}>
      <LabelContainer>
        <Text variant="body-3" color="tertiary" textAlign="left" width="fit-content">
          {labelText}
        </Text>
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

const Url = styled.div`
  width: 90%;
  ${createFontStyles('body-3')};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export default HitItemRow;
