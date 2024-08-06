import { Container, Tag, createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type TitleProps = {
  title: string;
  subtitle?: string;
  tag?: string;
  variant?: 'primary' | 'secondary';
};

const Title = ({ title, subtitle, tag, variant }: TitleProps) => (
  <StyledContainer>
    {tag && <Tag>{tag}</Tag>}
    <Heading variant={variant}>{title}</Heading>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
  </StyledContainer>
);

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
    margin: auto;

    && {
      max-width: 640px;
    }
  `}
`;

const Heading = styled.h2<{ variant?: 'primary' | 'secondary' }>`
  ${({ theme, variant }) => css`
    ${createFontStyles(variant === 'primary' ? 'display-2' : 'heading-1')}
    color: ${theme.color.primary};
    text-align: center;
  `}
`;

const Subtitle = styled.h4`
  ${({ theme }) => css`
    ${createFontStyles('body-1')}
    color: ${theme.color.secondary};
    text-align: center;
  `}
`;

export default Title;
