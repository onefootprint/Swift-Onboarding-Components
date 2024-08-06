import { Stack, media } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

import type { CompanyDetailsProps } from '../../case-study-layout';
import Field from './components/field';

enum Labels {
  Name = 'Name',
  Logo = 'Logo',
  Industry = 'Industry',
  CustomerSince = 'Customer Since',
  Website = 'Website',
}

const SummaryCard = ({ name, logo, industry, customerSince, website }: CompanyDetailsProps) => (
  <Container direction="column">
    <Header align="center" justify="center" padding={5}>
      {logo && (
        <LogoContainer gap={7} direction="column" align="center" justify="center">
          <Image src={logo} alt={name} width={100} height={100} />
        </LogoContainer>
      )}
    </Header>
    <Stack gap={7} direction="column" padding={7}>
      {name && <Field label={Labels.Name} value={name} />}
      {industry && <Field label={Labels.Industry} value={industry} />}
      {customerSince && <Field label={Labels.CustomerSince} value={customerSince} />}
      {website && <Field label={Labels.Website} value={website} href={website} />}
    </Stack>
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: sticky;
    height: fit-content;
    top: ${theme.spacing[11]};
    width: 100%;
    z-index: 1;
    display: none;

    ${media.greaterThan('md')`
      display: flex;
    `}
  `}
`;

const Header = styled(Stack)`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const LogoContainer = styled(Stack)`
  height: 32px;
  img {
    object-fit: contain;
    object-position: center;
    width: 100%;
    height: 100%;
  }
`;

export default SummaryCard;
