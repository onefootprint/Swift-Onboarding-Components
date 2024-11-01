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
    <Stack align="center" justify="space-between" direction="row" maxWidth="100%">
      <Text variant="body-3" truncate>
        {url}
      </Text>
      <CopyButton ariaLabel={t('copy')} contentToCopy={url} tooltip={{ position: 'bottom' }} />
    </Stack>
  );

  const renderGeneralValue = (generalValue: string) => (
    <Text variant="body-3">{generalValue.charAt(0).toUpperCase() + generalValue.slice(1)}</Text>
  );

  const renderShowAllValue = () => (
    <LinkButton variant="label-3" onClick={handleShowAllFields}>
      {t('show-all.value')}
    </LinkButton>
  );

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
    <Stack
      direction="column"
      // biome-ignore lint/a11y/useSemanticElements: TODO: change to <fieldset />
      role="group"
      aria-label={fieldName}
      gap={1}
    >
      <Text variant="body-3" color="tertiary" textAlign="left">
        {labelText}
      </Text>
      <ValueContainer>{valueElement}</ValueContainer>
    </Stack>
  );
};

const ValueContainer = styled(Box)`
  ${createFontStyles('body-3')}
`;

export default HitItemRow;
