import type { Icon } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type LinkItemProps = {
  IconComponent: Icon;
  onClick: () => void;
  label: string;
};

const LinkItem = ({ label, IconComponent, onClick }: LinkItemProps) => (
  <Item onClick={onClick}>
    <IconComponent color="tertiary" />
    <Text variant="body-3" color="tertiary">
      {label}
    </Text>
  </Item>
);

const Item = styled.button`
  ${({ theme }) => css`
    background: none;
    border: 0;
    cursor: pointer;
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
    padding: 0;
    height: 32px;

    @media (hover: hover) {
      &:hover {
        > * {
          color: ${theme.color.secondary};
        }

        path {
          fill: ${theme.color.secondary};
        }
      }
    }
  `}
`;

export default LinkItem;
