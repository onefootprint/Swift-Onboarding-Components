import { IcoFlag16, IcoInfo16, IcoPlusSmall16 } from '@onefootprint/icons';
import type { EntityLabel } from '@onefootprint/types';
import { Dropdown, Stack, Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useLabelText from '../hooks/use-label-text';

type TriggerProps = {
  value: EntityLabel | null;
};

export const Trigger = ({ value }: TriggerProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'header-default.fraud-label' });
  const labelT = useLabelText();
  const hasValue = value !== null;

  return (
    <Dropdown.Trigger aria-label={t('add-aria-label')} asChild>
      <Container tag="button">
        {hasValue ? <IcoFlag16 /> : <IcoPlusSmall16 />}
        <Text variant="caption-1">{hasValue ? labelT(value as EntityLabel) : t('add-label')}</Text>
        <Tooltip text={t('tooltip')}>
          <IcoInfo16 />
        </Tooltip>
      </Container>
    </Dropdown.Trigger>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    transition: background-color 0.1s ease-in-out, width 0.3s ease-out;
    width: fit-content;
    &:hover,
    &:active {
      background-color: ${theme.backgroundColor.senary};
    }
  `}
`;

export default Trigger;
