import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { ParameterProps } from 'src/pages/api-reference/api-reference.types';

import { SchemaBody } from '../schema';
import useParametersGroupBySections from './hooks/use-parameters-grouped-by-section';

const Parameters = ({ parameters }: { parameters: ParameterProps[] }) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const sections = useParametersGroupBySections(parameters);

  return (
    <Stack direction="column" gap={4}>
      {sections.map(section => (
        <Stack direction="column" gap={2} key={section.title}>
          <Text variant="label-1" color="secondary">
            {t(section.title as ParseKeys<'common'>)}
          </Text>
          <SchemaBody schema={section.parameters} />
        </Stack>
      ))}
    </Stack>
  );
};

export default Parameters;
