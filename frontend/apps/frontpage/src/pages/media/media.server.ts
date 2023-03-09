import type { GetStaticProps } from 'next';

import type { Article } from './media.types';

const getStaticProps: GetStaticProps = () => {
  const articles: Article[] = [
    {
      id: '8',
      url: 'https://www.fastcompany.com/90831259/this-gen-z-tech-ceo-wants-to-build-the-apple-pay-of-identity-a-one-stop-shop-for-your-data',
      imageUrl: '/media/fast-co.png',
      imageAlt: 'Our founder and CEO, Eli Wachs.',
      publishedAt: 'Jan 7, 2023',
      website: 'Fast Company',
      title:
        'This Gen-Z tech CEO wants to build the Apple Pay of identity—a one-stop shop for your data',
      excerpt:
        'Eli Wachs, cofounder of Footprint, is finding success in the verification business at a time when consumer trust is increasingly hard to come by.',
    },
    {
      id: '7',
      url: 'https://open.spotify.com/show/6k1YLBvORRMyosKy3x1xIl',
      imageUrl: '/media/not-boring.png',
      imageAlt: 'Our founders, Eli and Alex',
      publishedAt: 'Aug 5, 2022',
      website: 'Not Boring Podcast',
      title: 'Not Boring founders: Eli Wachs & Alex Grinman',
      excerpt:
        "Eli Wachs & Alex Grinman are the co-founders of Footprint. Footprint's mission is to bring back trust on the internet. The company wants to put people in control of their identity while solving KYC, IDV, and PII storage problems for enterprises. Footprint just announced a $6M Seed Round led by Index Ventures.",
    },
    {
      id: '6',
      url: 'https://techcrunch.com/2022/08/03/footprint-wants-to-change-how-companies-collect-store-and-share-personal-data/',
      imageUrl: '/media/techcrunch.png',
      imageAlt:
        'Young Asian woman using face recognition software via smartphone, in front of colourful neon signboards in busy downtown city street at night. Biometric verification and artificial intelligence concept',
      publishedAt: 'Aug 3, 2022',
      website: 'TechCrunch',
      title:
        'Footprint wants to change how companis collect, store and share personal data',
      excerpt:
        'Anyone who has ever applied for an apartment or a mortgage knows that these companies tend to collect much more information than they need to determine if you can afford the monthly payment...',
    },
    {
      id: '5',
      imageAlt: 'Eli, our co-founder, being interviewed by Shardul Shah',
      url: 'https://www.indexventures.com/perspectives/footprint-emerges-from-stealth-to-transform-digital-identity/',
      imageUrl: '/media/index-ventures.png',
      publishedAt: 'Aug 3, 2022',
      website: 'Index Ventures',
      title: 'Footprint Emerges from Stealth to Transform Digital Identity',
      excerpt:
        'Today, when consumers are asked to verify their identity (such as creating a bank account, applying for a credit card, or onboarding to a new job), they have to go through the same process of entering...',
    },
    {
      id: '4',
      imageAlt: 'Green silhouette of a person made up of 0 and 1',
      url: 'https://www.darkreading.com/dr-tech/new-startup-footprint-tackles-identity-verification',
      imageUrl: '/media/dark-reading.png',
      publishedAt: 'Aug 3, 2022',
      website: 'DARKReading',
      title: 'Startup Footprint Tackles Identity Verification',
      excerpt:
        'Whenever a person walks into a financial services institution to open a bank account, apply for a loan, or obtain a credit card, that institution needs to first verify that person’s identity. Personal info...',
    },
    {
      id: '3',
      imageAlt: 'Footprint logo',
      url: 'https://lererhippeau.medium.com/please-welcome-footprint-the-last-identity-form-youll-ever-fill-out-cc917d252b4e',
      imageUrl: '/media/lerer-hippeau.png',
      publishedAt: 'Aug 3, 2022',
      website: 'Lerer Hippeau',
      title:
        'Please welcome Footprint, the last identity form you’ll ever fill out',
      excerpt:
        'Being a digital citizen requires using identity credentials, including SSN, DL, DOB, education and employment history, income, and more, online. Current verification processes are broken, though. They add...',
    },
  ];
  return { props: { articles } };
};

export default getStaticProps;
