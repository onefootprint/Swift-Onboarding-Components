import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Grid from '../../../grid';
import Stack from '../../../stack';
import Text from '../../../text';

const dayTranslations = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const WeekHeader = () => {
  const { t } = useTranslation('ui');
  return (
    <Container columns={['repeat(7,40px)']} rows={['32px']}>
      {dayTranslations.map(day => (
        <Stack key={day} justify="center">
          <Text variant="label-4" color="tertiary">
            {t(`global.days-short.${day}`, { defaultValue: day })}
          </Text>
        </Stack>
      ))}
    </Container>
  );
};

const Container = styled(Grid.Container)`
  ${({ theme }) => css`
    user-select: none;
    pointer-events: none;
    padding: 0 ${theme.spacing[5]};
  `}
`;

export default WeekHeader;
