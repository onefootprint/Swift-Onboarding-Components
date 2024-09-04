import { IcoCloseSmall16 } from '@onefootprint/icons';
import { Stack, Text, createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type ActiveTagProps = {
  text: string;
  onClick: () => void;
};

const ActiveTag = ({ text, onClick }: ActiveTagProps) => {
  return (
    <Container>
      <TagContainer>
        <Text variant="label-4" color="tertiary">
          #
        </Text>
        <Text variant="label-4">{text}</Text>
      </TagContainer>
      <TriggerContainer onClick={onClick}>
        <IcoCloseSmall16 />
      </TriggerContainer>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
  `};
`;

const TagContainer = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    white-space: nowrap;
  `};
`;

const TriggerContainer = styled.button`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    padding: ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[1]};
    cursor: pointer;
    border: none;
    background-color: ${theme.backgroundColor.transparent};
    border-top-right-radius: ${theme.borderRadius.full};
    border-bottom-right-radius: ${theme.borderRadius.full};

    &:hover {
      background-color: ${theme.backgroundColor.senary};
    }
  `};
`;

export default ActiveTag;
