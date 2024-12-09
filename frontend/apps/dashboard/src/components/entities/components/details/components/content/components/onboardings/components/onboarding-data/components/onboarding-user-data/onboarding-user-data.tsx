import { Box } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import hasLegalStatus from '../../utils/has-legal-status';
import hasNationality from '../../utils/has-nationality';
import Fieldset from './components/fieldset';
import useField from './hooks/use-field';
import useFieldsets from './hooks/use-fieldsets';
import type { VaultType } from './hooks/use-seqno-vault';

type OnboardingUserDataProps = {
  vaultData: VaultType | undefined;
};

const OnboardingUserData = ({ vaultData }: OnboardingUserDataProps) => {
  const hasCustomData = Object.keys(vaultData?.vault || {}).some(di => di.startsWith('custom'));
  const includeNationality = hasNationality(vaultData) && !hasLegalStatus(vaultData);
  const { basic, address, identity, custom } = useFieldsets(includeNationality);
  const getFieldProps = useField(vaultData);

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
