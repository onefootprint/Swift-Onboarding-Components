import dynamic from 'next/dynamic';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled';
import { Box } from 'ui';

import Articles from './components/articles';
import Footer from './components/footer';
import GetStartedSection from './components/get-started-section';
import Hero from './components/hero';
import InvestorsSection from './components/investors-section';
import Navbar from './components/navbar';
import TestimonialSection from './components/testimonial-section';
import VaultSection from './components/vault-section';
import S from './home.styles';
import useContent from './hooks/use-content';

const Why = dynamic(() => import('./components/why'));

const Home = () => {
  const content = useContent();
  return (
    <>
      <Head>
        <title>Footprint</title>
      </Head>
      <S.SectionSpacing>
        <S.HeaderGradient>
          <Navbar ctaText="Join the waitlist" logoAltText="Footprint Logo's" />
          <Hero
            ctaText="Join the waitlist"
            imageAltText="An image of Footprint System"
            subtitleText="Footprint is a unified platform bringing together one-click KYC and a PII Vault."
            titleText="Frictionless Identity. High Integrity."
          />
        </S.HeaderGradient>
      </S.SectionSpacing>
      <S.SectionSpacing>
        <Why titleText="Bringing back trust." subtitleText="Why Footprint?" />
      </S.SectionSpacing>
      <Box sx={{ marginBottom: 11 }}>
        <Articles
          titleText="Accurate, portable, and secure user verification"
          subtitleText="A better, more secure experience"
          items={[
            {
              titleText: 'Best-in-class security',
              descriptionText:
                'Footprint’s privacy-preserving technology lets you satisfy KYC without needing to ever touch PII through our architecture. Utilize our PII vault which by default uses secure enclaves to protect data instead of building your own.',
              imageAltText: '',
              imagePath: '/images/article-1.png',
            },
            {
              titleText: 'Unprecedented accuracy',
              descriptionText:
                'Footprint’s ecosystem creates a feedback loop on actors to increase accuracy through peer-to-peer verification, and our liveness scanning ensures only real people are applying. We use the most cutting edge biometric scans to ensure real people are making accounts',
              imageAltText: '',
              imagePath: '/images/article-2.png',
            },
            {
              titleText: 'More functionality, less dollars',
              descriptionText:
                'Footprint’s technology combines storage and verification. Our solution is up to 2x cheaper than traditional methods to verify and store PII because we are able to condense what today requires multiple tools into one.',
              imageAltText: '',
              imagePath: '/images/article-3.png',
            },
          ]}
        />
      </Box>
      <Box sx={{ marginBottom: 12 }}>
        <Articles
          titleText="A new, comprehensive approach to KYC & PII storage"
          subtitleText="Our advantages"
          items={[
            {
              titleText: '12x faster',
              descriptionText:
                'Our one-click flow increases conversion by dramatically reducing time to account creation.',
              imageAltText: '',
              imagePath: '/images/article-4.png',
            },
            {
              titleText: '10x developer experience',
              descriptionText:
                "With three lines of code, you'll have KYC and PII Vaulting running in less than a day. It's that simple.",
              imageAltText: '',
              imagePath: '/images/article-5.png',
            },
            {
              titleText: '2x cheaper',
              descriptionText:
                'Say goodbye to needing separate KYC and Tokenization tools. We do both in-one, and pass along the savings.',
              imageAltText: '',
              imagePath: '/images/article-6.png',
            },
          ]}
        />
      </Box>
      <TestimonialSection
        author={content.testimonial.author}
        content={content.testimonial.content}
      />
      <VaultSection
        articles={content.vault.articles.secondaries}
        description={content.vault.description}
        mainArticle={content.vault.articles.main}
        subtitle={content.vault.subtitle}
        title={content.vault.title}
      />
      <FooterContainer>
        <InvestorsSection
          imgAlt={content.investors.imgAlt}
          imgSrc={content.investors.imgSrc}
          subtitle={content.investors.subtitle}
          title={content.investors.title}
        />
        <GetStartedSection
          cta={content.getStarted.cta}
          subtitle={content.getStarted.subtitle}
          title={content.getStarted.title}
        />
        <Footer
          copyright={content.footer.copyright}
          links={content.footer.links}
        />
      </FooterContainer>
    </>
  );
};

const FooterContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.tertiary};
  `}
`;

export default Home;
