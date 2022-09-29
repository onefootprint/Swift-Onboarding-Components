import { useTranslation } from '@onefootprint/hooks';
import {
  IcoChartUp40,
  IcoCheckCircle40,
  IcoEmojiHappy40,
  IcoHeart40,
  IcoLeaf40,
  IcoShield40,
} from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { media, Typography } from 'ui';

import SEO from '../../components/seo';
import CompanyPhotos from './components/company-photos';
import Team from './components/team';
import Values from './components/values';

const Company = () => {
  const { t } = useTranslation('pages.company');
  const values = [
    {
      id: 'intellectually-curious',
      title: t('values.list.intellectually-curious.title'),
      description: t('values.list.intellectually-curious.description'),
      iconComponent: IcoLeaf40,
    },
    {
      id: 'lead-with-empathy',
      title: t('values.list.lead-with-empathy.title'),
      description: t('values.list.lead-with-empathy.description'),
      iconComponent: IcoHeart40,
    },
    {
      id: 'work-hard-be-happy',
      title: t('values.list.work-hard-be-happy.title'),
      description: t('values.list.work-hard-be-happy.description'),
      iconComponent: IcoEmojiHappy40,
    },
    {
      id: 'mistakes-and-learn',
      title: t('values.list.mistakes-and-learn.title'),
      description: t('values.list.mistakes-and-learn.description'),
      iconComponent: IcoCheckCircle40,
    },
    {
      id: 'no-shortcuts',
      title: t('values.list.no-shortcuts.title'),
      description: t('values.list.no-shortcuts.description'),
      iconComponent: IcoChartUp40,
    },
    {
      id: 'reputation',
      title: t('values.list.reputation.title'),
      description: t('values.list.reputation.description'),
      iconComponent: IcoShield40,
    },
  ];
  const team = [
    {
      name: 'Alex Grinman',
      avatarSrc: '/team/member-alex.png',
      role: 'Co-founder, CTO',
      linkedin: 'https://www.linkedin.com/in/agrinman/',
      twitter: 'https://twitter.com/AlexGrinman',
    },
    {
      name: 'Belce Dogru',
      avatarSrc: '/team/member-belce.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/belce/',
      twitter: 'https://twitter.com/belce_dogru',
    },
    {
      name: 'Dave Argoff',
      avatarSrc: '/team/member-dave.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/dave-argoff-54059a64/',
      twitter: 'https://twitter.com/daveargoff',
    },
    {
      name: 'Eli Wachs',
      avatarSrc: '/team/member-eli.png',
      role: 'Co-founder, CEO',
      linkedin: 'https://www.linkedin.com/in/eli-wachs-15a609a6/',
      twitter: 'https://twitter.com/EliWachs',
    },
    {
      name: 'Elliott Forde',
      avatarSrc: '/team/member-elliott.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/elliott-forde-18454b124/',
      twitter: 'https://twitter.com/elliottvforde',
    },
    {
      name: 'Karen Mok',
      avatarSrc: '/team/member-karen.png',
      role: 'Chief of Staff',
      linkedin: 'https://www.linkedin.com/in/karenjmok/',
      twitter: 'https://twitter.com/themokstories',
    },
    {
      name: 'Omar Cameron',
      avatarSrc: '/team/member-omar.png',
      role: 'Sales',
      linkedin: 'https://www.linkedin.com/in/omar-cameron/',
    },
    {
      name: 'Pedro Marques',
      avatarSrc: '/team/member-pedro.png',
      role: 'Design',
      linkedin: 'https://www.linkedin.com/in/phmarques/',
      twitter: 'https://twitter.com/marques_ph',
    },
    {
      name: 'Rafael Motta',
      avatarSrc: '/team/member-rafael.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/rafamotta/',
      twitter: 'https://twitter.com/rafaelmotta021',
    },
  ];

  const companyPhotos = [
    {
      alt: 'Fall 2022 Offsite Destination',
      src: '/company/offsite.png',
    },
    {
      alt: 'Team Dinner',
      src: '/company/dinner.png',
    },
  ];

  return (
    <>
      <SEO title={t('html-title')} slug="/company" />
      <Container>
        <HeroContainer>
          <Typography variant="display-1" as="h1" sx={{ marginBottom: 5 }}>
            {t('title')}
          </Typography>
          <Typography variant="display-4" as="h2" color="secondary">
            {t('subtitle')}
          </Typography>
        </HeroContainer>
        <CompanyPhotosContainer>
          <CompanyPhotos photos={companyPhotos} />
        </CompanyPhotosContainer>
        <ValuesContainer>
          <Values
            title={t('values.title')}
            description={t('values.description')}
            items={values}
          />
        </ValuesContainer>
        <TeamContainer>
          <Team
            cta={t('team.cta')}
            description={t('team.description')}
            items={team}
            title={t('team.title')}
          />
        </TeamContainer>
      </Container>
    </>
  );
};

const CompanyPhotosContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]}px;
    `}
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 960px;
    padding: 0 ${theme.spacing[5]}px;

    ${media.greaterThan('lg')`
      padding: 0;
    `}
  `}
`;

const HeroContainer = styled.div`
  ${({ theme }) => css`
    margin: 0 auto ${theme.spacing[10]}px;
    max-width: 700px;
    text-align: center;
  `}
`;

const ValuesContainer = styled.section`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]}px;
    `}
  `}
`;

const TeamContainer = styled.section`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[12]}px;
    `}
  `}
`;

export default Company;
