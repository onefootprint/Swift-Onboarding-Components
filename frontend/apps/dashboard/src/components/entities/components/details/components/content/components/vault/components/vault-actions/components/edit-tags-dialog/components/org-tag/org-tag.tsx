import { IcoPlusSmall16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type OrgTagProps = {
  text: string;
  onClick: () => void;
};

const OrgTag = ({ text, onClick }: OrgTagProps) => {
  return (
    <Stack backgroundColor="secondary" borderRadius="sm" height="28px">
      <Stack gap={1} paddingInline={3} center>
        <Text variant="label-3" color="tertiary">
          #
        </Text>
        <Text variant="label-3" whiteSpace="nowrap">
          {text}
        </Text>
      </Stack>
      <AddButton type="button" onClick={onClick} aria-label="Add tag">
        <IcoPlusSmall16 />
      </AddButton>
    </Stack>
  );
};

const AddButton = styled.button`
  ${({ theme }) => css`
    align-items: center;
    background-color: transparent;
    border-bottom-right-radius: ${theme.borderRadius.sm};
    border: unset;
    border-left: 1px solid ${theme.borderColor.tertiary};
    border-top-right-radius: ${theme.borderRadius.sm};
    cursor: pointer;
    display: flex;
    height: 28px;
    justify-content: center;
    margin: 0;
    padding: 0;
    width: 28px;

    &:hover {
      background-color: ${theme.backgroundColor.senary};
    }
  `};
`;

export default OrgTag;
