import { useIntl } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
import { rgba } from 'polished';
import React from 'react';
import styled, { css } from 'styled-components';

import PostContent from './components/post-content/post-content';
import Progress from './components/progress';

const BLUR_COLORS = [
  rgba(154, 255, 141, 0.181),
  rgba(156, 178, 255, 0.181),
  rgba(253, 146, 255, 0.181),
  rgba(255, 146, 146, 0.181),
  rgba(255, 255, 146, 0.181),
  rgba(73, 255, 215, 0.181),
];

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
}: CardProps) => {
  const { formatDateWithLongMonth } = useIntl();
  const formattedDate = formatDateWithLongMonth(new Date(date));

  return (
    <Container id={slug}>
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

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    position: relative;
    height: auto;
    align-items: stretch;
    width: fit-content;
    margin: auto;
    background: radial-gradient(
      50% 50% at 20% 20%,
      ${BLUR_COLORS}[Math.floor(Math.random() * ${BLUR_COLORS}.length)] 0%,
      ${theme.backgroundColor.primary} 100%
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
    `}
  `}
`;

const PostContainer = styled.div`
  max-width: 830px;
`;

export default Card;
