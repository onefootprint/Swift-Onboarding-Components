import type { WithEntityProps } from '@/entities/components/details/components/with-entity';
import { hasEntityNationality, hasEntityUsLegalStatus } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import Fieldset from './components/fieldset';
import useFieldsets from './hooks/use-fieldsets';

const OnboardingUserData = ({ entity }: WithEntityProps) => {
  const hasLegalStatus = hasEntityUsLegalStatus(entity);
  const includeNationality = hasEntityNationality(entity) && !hasLegalStatus;
  const { basic, address, identity, custom } = useFieldsets(includeNationality);

  return (
    <Container>
      <Fieldset fields={basic.fields} title={basic.title} />
      <Fieldset fields={address.fields} title={address.title} />
      <Fieldset fields={identity.fields} title={identity.title} />
      <Fieldset fields={custom.fields} title={custom.title} />
    </Container>
  );
};

const Container = styled(Box)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing[7]} ${theme.spacing[9]};
  `};
`;

export default OnboardingUserData;
