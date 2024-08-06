import type { Icon } from '@onefootprint/icons';
import { Grid, Text, media } from '@onefootprint/ui';
import rgba from 'polished/lib/color/rgba';
import styled, { css } from 'styled-components';

type ValuesProps = {
  title: string;
  description: string;
  items: {
    id: string;
    title: string;
    description: string;
    iconComponent: Icon;
  }[];
};

const Values = ({ title, description, items }: ValuesProps) => (
  <>
    <TitleContainer>
      <Text variant="display-3" tag="h3" marginBottom={5}>
        {title}
      </Text>
      <Text variant="body-1" color="secondary">
        {description}
      </Text>
    </TitleContainer>
    <ItemsContainer as="ul" gap={5}>
      {items.map(item => {
        const Icon = item.iconComponent;
        return (
          <Item key={item.id}>
            <IconContainer>
              <Icon />
            </IconContainer>
            <Text variant="heading-3" marginBottom={4}>
              {item.title}
            </Text>
            <Text variant="body-1" color="secondary">
              {item.description}
            </Text>
          </Item>
        );
      })}
    </ItemsContainer>
  </>
);

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[9]};
  `}
`;

const ItemsContainer = styled(Grid.Container)`
  grid-template-columns: repeat(1, 1fr);

  ${media.greaterThan('lg')`
      grid-template-columns: repeat(2, 1fr);
    `}
`;

const Item = styled.li`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[8]};
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${rgba('#CBC1F6', 0.6)};
    border-radius: ${theme.borderRadius.full};
    display: flex;
    height: 56px;
    justify-content: center;
    margin-bottom: ${theme.spacing[7]};
    padding: ${theme.spacing[3]};
    width: 56px;
  `}
`;

export default Values;
