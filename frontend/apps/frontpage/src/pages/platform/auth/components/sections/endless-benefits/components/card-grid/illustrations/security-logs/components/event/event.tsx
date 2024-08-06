import { IcoCheckCircle16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type EventProps = {
  text: string;
};

const Event = ({ text }: EventProps) => (
  <Container justify="start" direction="row" align="center" gap={3}>
    <IcoCheckCircle16 color="tertiary" />
    <Text variant="label-3" color="tertiary">
      {text}
    </Text>
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    padding: ${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[2]}
      ${theme.spacing[3]};
    width: fit-content;

    p {
      white-space: nowrap;
    }
  `}
`;

export default Event;
