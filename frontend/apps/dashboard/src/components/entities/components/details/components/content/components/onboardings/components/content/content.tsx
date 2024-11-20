import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { FIELDSET_HEADER_HEIGHT } from '../../../../constants';

type ContentProps = {
  onboardings: EntityOnboarding[];
};

const Content = ({ onboardings }: ContentProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.header',
  });
  const { playbookKey, timestamp, status } = onboardings[0];

  return (
    <Container>
      <Header>
        <Text variant="label-3" tag="h2">
          {t('onboarded-onto', {
            playbook: playbookKey,
            timestamp: format(new Date(timestamp), 'MM/dd/yyyy, hh:mm a'),
          })}
        </Text>
        <Text variant="label-3">{t('outcome', { status })}</Text>
      </Header>
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

export default Content;
