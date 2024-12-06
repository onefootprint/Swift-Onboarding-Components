import { IcoCheck16 } from '@onefootprint/icons';
import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { Dropdown, Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { FIELDSET_HEADER_HEIGHT } from '../../../../constants';
import useStatusText from '../../hooks/use-status-text';
import OnboardingData from '../onboarding-data';
import Trigger from '../trigger ';

type ContentProps = {
  onboardings: EntityOnboarding[];
};

const Content = ({ onboardings }: ContentProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.header',
  });
  const statusT = useStatusText();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState<EntityOnboarding>(onboardings[0]);
  const { kind, playbookName, status, timestamp } = selectedOnboarding;

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const getTimestampText = (ts: string) => format(new Date(ts), 'MM/dd/yyyy, hh:mm a');

  const getOnboardingLabel = (playbookName: string, kind: unknown, timestamp?: string) => {
    const nameText = kind === 'document' ? t('document-upload') : t('onboarded-onto', { playbookName });
    return timestamp ? `${nameText} ⋅ ${getTimestampText(timestamp)}` : nameText;
  };

  const getStatusColor = () => {
    if (status === 'pass') return 'success';
    if (status === 'fail') return 'error';
    return 'neutral';
  };

  return (
    <Container>
      <Header>
        <Dropdown.Root open={isOpen} onOpenChange={toggleDropdown}>
          <Trigger isOpen={isOpen} value={getOnboardingLabel(playbookName, kind, timestamp)} />
          <Dropdown.Portal>
            <ContentContainer align="end" sideOffset={4}>
              {onboardings.map(onboarding => (
                <ItemContainer
                  key={onboarding.id}
                  onClick={() => setSelectedOnboarding(onboarding)}
                  checked={selectedOnboarding.id === onboarding.id}
                  iconRight={selectedOnboarding.id === onboarding.id ? IcoCheck16 : undefined}
                >
                  <Stack direction="column" gap={2} align="flex-start">
                    <Text variant="label-3">{getOnboardingLabel(onboarding.playbookName, onboarding.kind)}</Text>
                    <Text variant="label-3" color="tertiary">
                      {getTimestampText(onboarding.timestamp)}
                    </Text>
                  </Stack>
                </ItemContainer>
              ))}
            </ContentContainer>
          </Dropdown.Portal>
        </Dropdown.Root>
        <Stack align="center" gap={3}>
          <Text variant="label-3">{t('outcome')}</Text>
          <Text variant="label-3" color={getStatusColor()}>
            {statusT(status)}
          </Text>
        </Stack>
      </Header>
      <OnboardingData onboarding={selectedOnboarding} />
    </Container>
  );
};

const Container = styled.fieldset`
  ${({ theme }) => css`
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: space-between;
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    height: ${FIELDSET_HEADER_HEIGHT}px;
  `};
`;

const ContentContainer = styled(Dropdown.Content)`
  ${({ theme }) => css`
    width: 340px;
    padding: ${theme.spacing[3]} 0;
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

export default Content;
