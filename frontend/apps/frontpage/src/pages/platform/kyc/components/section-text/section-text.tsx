import { IcoCheck16 } from '@onefootprint/icons';
import { Box, Text, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

type SectionTextProps = {
  title: string;
  subtitle: string;
  items: string[];
  iconSrc?: string;
};

const SectionText = ({ title, subtitle, items, iconSrc }: SectionTextProps) => (
  <Container>
    {iconSrc && <Image src={iconSrc} alt="section icon" width={80} height={80} />}
    <TitleContainer>
      <Title tag="h3">{title}</Title>
      <Subtitle tag="h4">{subtitle}</Subtitle>
    </TitleContainer>
    <ItemsContainer tag="ul">
      {items.map(item => (
        <ItemContainer key={item} tag="li">
          <IconWrapper>
            <IcoCheck16 color="accent" />
          </IconWrapper>
          <Text variant="body-1" color="secondary">
            {item}
          </Text>
        </ItemContainer>
      ))}
    </ItemsContainer>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    max-width: 470px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[9]} 0 ${theme.spacing[9]} 0;

    ${media.greaterThan('md')`
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: calc(-1 * ${theme.spacing[9]});
        width: ${theme.borderWidth[1]};
        height: 100%;
        background: radial-gradient(
          50% 85% at 50% 50%,
          ${theme.borderColor.primary} 0%,
          ${theme.borderColor.transparent} 100%
        );
      }
    `}
  `}
`;

const Title = styled(Box)`
  ${({ theme }) => css`
  position: relative;
  ${createFontStyles('heading-2')}

  ${media.greaterThan('md')`
    &::before {
      content: '';
      position: absolute;
      left: calc(-1 * ${theme.spacing[9]});
      top: 0;
      height: 100%;
      width: ${theme.borderWidth[1]};
      background: ${theme.color.accent};
    `}
    }
  `}
`;

const Subtitle = styled(Box)`
  ${({ theme }) => css`
    ${createFontStyles('heading-3')}
    font-weight: 400;
    color: ${theme.color.secondary};
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    margin-top: ${theme.spacing[4]};
  `}
`;

const ItemsContainer = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

const ItemContainer = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[4]};
  `}
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
`;

export default SectionText;
