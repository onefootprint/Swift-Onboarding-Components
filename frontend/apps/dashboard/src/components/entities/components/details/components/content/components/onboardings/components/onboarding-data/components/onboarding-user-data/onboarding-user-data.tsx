import type { WithEntityProps } from '@/entities/components/details/components/with-entity';
import { hasEntityNationality, hasEntityUsLegalStatus } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import Fieldset from './components/fieldset';
import useField from './hooks/use-field';
import useFieldsets from './hooks/use-fieldsets';

type OnboardingUserDataProps = WithEntityProps & {
  seqno?: number;
};

const OnboardingUserData = ({ entity, seqno }: OnboardingUserDataProps) => {
  const hasCustomData = entity.data.some(attr => attr.identifier.startsWith('custom'));
  const hasLegalStatus = hasEntityUsLegalStatus(entity);
  const includeNationality = hasEntityNationality(entity) && !hasLegalStatus;
  const { basic, address, identity, custom } = useFieldsets(includeNationality);
  const getFieldProps = useField(entity, seqno);

  return (
    <Container>
      <Fieldset fields={basic.fields} title={basic.title} useField={getFieldProps} />
      <Fieldset fields={address.fields} title={address.title} useField={getFieldProps} />
      <Fieldset fields={identity.fields} title={identity.title} useField={getFieldProps} />
      {hasCustomData && <Fieldset fields={custom.fields} title={custom.title} useField={getFieldProps} />}
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
