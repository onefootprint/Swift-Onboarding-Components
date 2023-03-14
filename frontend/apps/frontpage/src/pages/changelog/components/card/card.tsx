import { useIntl } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import PostContent from './components/post-content/post-content';
import Progress from './components/progress';

type CardProps = {
  date: string;
  featureImageUrl?: string;
  featureImageAlt: string;
  authorName: string;
  authorImg: string;
  title: string;
  html?: string;
  last?: boolean | false;
  active?: boolean | false;
  slug: string;
  blurColor: string | 'rgba(171, 255, 163, .15)';
};

const Card = ({
  date,
  title,
  featureImageUrl,
  authorName,
  authorImg,
  html,
  last,
  featureImageAlt,
  active,
  slug,
  blurColor,
}: CardProps) => {
  const { formatDateWithLongMonth } = useIntl();
  const formattedDate = formatDateWithLongMonth(new Date(date));

  return (
    <Container id={slug} blurColor={blurColor}>
      <DateDesktop>
        <Typography variant="label-3" color="tertiary">
          {formattedDate}
        </Typography>
      </DateDesktop>
      <Progress active={active} last={last} />
      <PostContainer>
        <PostContent
          date={date}
          title={title}
          featureImageUrl={featureImageUrl}
          authorName={authorName}
          authorImg={authorImg}
          html={html}
          featureImageAlt={featureImageAlt}
          slug={slug}
        />
      </PostContainer>
    </Container>
  );
};

const Container = styled.div<{
  blurColor: string | 'rgba(171, 255, 163, .15)';
}>`
  ${({ theme, blurColor }) => css`
    display: flex;
    flex-direction: row;
    position: relative;
    height: auto;
    align-items: stretch;
    width: fit-content;
    margin: auto;
    background: radial-gradient(
      50% 50% at 60% 30%,
      ${blurColor} 0%,
      ${theme.backgroundColor.primary} 75%
    );
  `}
`;

const DateDesktop = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: flex;
      margin-top: ${theme.spacing[1]};
      text-align: right;
      min-width: 136px;
      justify-content: flex-end;
    `}
  `}
`;

const PostContainer = styled.div`
  max-width: 830px;
`;

export default Card;
