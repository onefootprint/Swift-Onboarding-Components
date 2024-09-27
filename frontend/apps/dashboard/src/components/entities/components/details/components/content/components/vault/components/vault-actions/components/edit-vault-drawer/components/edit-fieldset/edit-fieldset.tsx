import type { Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import type { WithEntityProps } from '@/entity/components/with-entity';
import type { DataIdentifier } from '@onefootprint/types';
import EditField from '../edit-field';

export type EditFieldsetProps = WithEntityProps & {
  fields: DataIdentifier[];
  iconComponent: Icon;
  title: string;
};

const EditFieldset = ({ entity, fields, iconComponent: IconComponent, title }: EditFieldsetProps) => {
  return (
    <Container aria-label={title}>
      <Header>
        <Stack align="center" gap={3}>
          <IconComponent />
          <Text variant="label-2" tag="h2">
            {title}
          </Text>
        </Stack>
      </Header>
      <Stack direction="column" gap={4} padding={5} flex={1}>
        {fields.map(di => (
          <EditField key={di} di={di} entity={entity} />
        ))}
      </Stack>
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
  `};
`;

export default EditFieldset;
