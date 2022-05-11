import React from 'react';

import Characteristics from './components/characteristics';
import Hero from './components/hero';
import Navbar from './components/navbar';
import Why from './components/why';
import S from './home.styles';

const Home = () => (
  <>
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
    <S.SectionSpacing>
      <Characteristics
        titleText="Accurate, portable, and secure user verification"
        subtitleText="A better, more secure experience"
        articles={[
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
    </S.SectionSpacing>
  </>
);

export default Home;
