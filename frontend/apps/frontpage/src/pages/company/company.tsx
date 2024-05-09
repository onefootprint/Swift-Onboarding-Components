import {
  IcoChartUp40,
  IcoCheckCircle40,
  IcoEmojiHappy40,
  IcoHeart40,
  IcoLeaf40,
  IcoShield40,
} from '@onefootprint/icons';
import { Divider, media, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import CompanyPhotos from './components/company-photos';
import JoinUs from './components/join-us';
import Team from './components/team';
import Values from './components/values';

const Company = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.company' });
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
      name: 'Amanda Lee',
      avatarSrc: '/team/member-amanda.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/a7e/',
    },
    {
      name: 'Belce Dogru',
      avatarSrc: '/team/member-belce.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/belce/',
      twitter: 'https://twitter.com/belce_dogru',
    },
    {
      name: 'Bruno Batista',
      avatarSrc: '/team/member-bruno.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/bruno-batista-b25ab76b/',
    },
    {
      name: 'Claudio Angrigiani',
      avatarSrc: '/team/member-claudio.png',
      role: 'Design Engineering',
      linkedin: 'https://www.linkedin.com/in/claudioangrigiani/',
      twitter: 'https://twitter.com/clodoan',
    },
    {
      name: 'D M Raisul Ahsan',
      avatarSrc: '/team/member-ahsan.png',
      role: 'Product Engineer',
      linkedin: 'https://www.linkedin.com/in/raisulahsan/',
      twitter: 'https://twitter.com/ahsan_raisul',
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
      linkedin: 'https://www.linkedin.com/in/eliwachs/',
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
      name: 'Ethan Lowman',
      avatarSrc: '/team/member-ethan.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/ethan-lowman/',
    },
    {
      name: 'Lucas Gelfond',
      avatarSrc: '/team/member-lucas.png',
      role: 'Engineering',
      linkedin: 'https://www.linkedin.com/in/lucasgelfond/',
      twitter: 'https://twitter.com/gucaslelfond',
    },
    {
      name: 'Mike Hreben',
      avatarSrc: '/team/member-mike.jpeg',
      role: 'Sales',
      linkedin: 'https://www.linkedin.com/in/mikehreben/',
    },
    {
      name: 'Pedro Marques',
      avatarSrc: '/team/member-pedro.png',
      role: 'Design',
      linkedin: 'https://www.linkedin.com/in/phmarques/',
      twitter: 'https://twitter.com/marques_ph',
    },
    {
      name: 'Peter Sweeney',
      avatarSrc: '/team/member-peter.png',
      role: 'Growth',
      linkedin: 'https://www.linkedin.com/in/peter-sweeney-a78b85b9/',
      twitter: 'https://twitter.com/peter_sweeney0',
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
      alt: 'Spring 2023 Team Retreat',
      src: '/company/san-diego.jpg',
    },
    {
      alt: 'Team Activity',
      src: '/company/escapology.jpg',
    },
  ];

  return (
    <>
      <SEO title={t('html-title')} slug="/company" />
      <Container>
        <HeroContainer>
          <Text variant="display-2" tag="h1" marginBottom={5}>
            {t('title')}
          </Text>
          <Text variant="display-4" tag="h2" color="secondary">
            {t('subtitle')}
          </Text>
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
            description={t('team.description')}
            items={team}
            title={t('team.title')}
          />
        </TeamContainer>
        <Divider />
        <JoinUs />
      </Container>
    </>
  );
};

const CompanyPhotosContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]};

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]};
    `}
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 960px;
    padding: 0 ${theme.spacing[5]};

    ${media.greaterThan('lg')`
      padding: 0;
    `}
  `}
`;

const HeroContainer = styled.div`
  ${({ theme }) => css`
    margin: 0 auto ${theme.spacing[10]};
    max-width: 700px;
    text-align: center;
  `}
`;

const ValuesContainer = styled.section`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]};

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]};
    `}
  `}
`;

const TeamContainer = styled.section`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]};

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[12]};
    `}
  `}
`;

export default Company;
