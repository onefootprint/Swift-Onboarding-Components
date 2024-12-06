import { IcoCheck16, IcoChevronDown16 } from '@onefootprint/icons';
import { Dropdown, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type OnboardingDataProps = {
  onClick: (isTriggered: boolean) => void;
};

const RulesDropdown = ({ onClick }: OnboardingDataProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.rules.dropdown',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggeredSelected, setIsTriggeredSelected] = useState(true);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleClick = (isTriggered: boolean) => {
    setIsTriggeredSelected(isTriggered);
    onClick(isTriggered);
  };

  return (
    <Dropdown.Root open={isOpen} onOpenChange={toggleDropdown}>
      <Dropdown.Trigger asChild>
        <TriggerContainer tag="button">
          <Text variant="label-3">{isTriggeredSelected ? t('triggered') : t('not-triggered')}</Text>
          <IconContainer align="center" data-is-open={isOpen} justify="center">
            <IcoChevronDown16 />
          </IconContainer>
        </TriggerContainer>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <ContentContainer align="end">
          <ItemContainer
            onClick={() => handleClick(true)}
            checked={isTriggeredSelected}
            iconRight={isTriggeredSelected ? IcoCheck16 : undefined}
          >
            <Text variant="caption-2">{t('triggered')}</Text>
          </ItemContainer>
          <ItemContainer
            onClick={() => handleClick(false)}
            checked={!isTriggeredSelected}
            iconRight={isTriggeredSelected ? undefined : IcoCheck16}
          >
            <Text variant="caption-2">{t('not-triggered')}</Text>
          </ItemContainer>
        </ContentContainer>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

const ContentContainer = styled(Dropdown.Content)`
  ${({ theme }) => css`
    width: 150px;
    padding: ${theme.spacing[2]} 0;
  `};
`;

const ItemContainer = styled(Dropdown.Item)`
  ${({ theme }) => css`
    height: fit-content;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

const TriggerContainer = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

const IconContainer = styled(Stack)`
  transition: transform 0.1s ease;

  &[data-is-open='true'] {
    transform: rotate(180deg);
  }
`;

export default RulesDropdown;
