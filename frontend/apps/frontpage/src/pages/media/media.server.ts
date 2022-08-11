import type { GetStaticProps } from 'next';

import type { Article } from './media.types';

const getStaticProps: GetStaticProps = () => {
  const articles: Article[] = [
    {
      id: '1',
      url: 'https://techcrunch.com/2022/08/03/footprint-wants-to-change-how-companies-collect-store-and-share-personal-data/',
      imageUrl: '/media/techcrunch.png',
      imageAlt:
        'Young Asian woman using face recognition software via smartphone, in front of colourful neon signboards in busy downtown city street at night. Biometric verification and artificial intelligence concept',
      createdAt: 'Aug 3, 2022',
      website: 'TechCrunch',
      title:
        'Footprint wants to change how companis collect, store and share personal data',
      excerpt:
        'Anyone who has ever applied for an apartment or a mortgage knows that these companies tend to collect much more information than they need to determine if you can afford the monthly payment...',
    },
    {
      id: '2',
      imageAlt: 'Eli, our co-founder, being interviewed by Shardul Shah',
      url: 'https://www.indexventures.com/perspectives/footprint-emerges-from-stealth-to-transform-digital-identity/',
      imageUrl: '/media/index-ventures.png',
      createdAt: 'Aug 3, 2022',
      website: 'Index Ventures',
      title: 'Footprint Emerges from Stealth to Transform Digital Identity',
      excerpt:
        'Today, when consumers are asked to verify their identity (such as creating a bank account, applying for a credit card, or onboarding to a new job), they have to go through the same process of entering...',
    },
    {
      id: '3',
      imageAlt: 'Green silhouette of a person made up of 0 and 1',
      url: 'https://www.darkreading.com/dr-tech/new-startup-footprint-tackles-identity-verification',
      imageUrl: '/media/dark-reading.png',
      createdAt: 'Aug 3, 2022',
      website: 'DARKReading',
      title: 'Startup Footprint Tackles Identity Verification',
      excerpt:
        'Whenever a person walks into a financial services institution to open a bank account, apply for a loan, or obtain a credit card, that institution needs to first verify that person’s identity. Personal info...',
    },
    {
      id: '4',
      imageAlt: 'Footprint logo',
      url: 'https://lererhippeau.medium.com/please-welcome-footprint-the-last-identity-form-youll-ever-fill-out-cc917d252b4e',
      imageUrl: '/media/lerer-hippeau.png',
      createdAt: 'Aug 3, 2022',
      website: 'Lerer Hippeau',
      title:
        'Please welcome Footprint, the last identity form you’ll ever fill out',
      excerpt:
        'Being a digital citizen requires using identity credentials, including SSN, DL, DOB, education and employment history, income, and more, online. Current verification processes are broken, though. They add...',
    },
    {
      id: '5',
      imageAlt: 'Footprint logo',
      url: 'https://www.finsmes.com/2022/08/footprint-raises-6m-in-seed-funding.html',
      imageUrl: '/media/finsmes.png',
      createdAt: 'Aug 3, 2022',
      website: 'FINSMES',
      title: 'Footprint Raises $6M in Seed Funding',
      excerpt:
        'Footprint, a NYC-based company that allows companies to securely onboard users, raised $6m in Seed funding.',
    },
    {
      id: '6',
      imageAlt: 'Footprint logo',
      url: 'https://www.prweb.com/releases/2022/8/prweb18825423.htm',
      imageUrl: '/media/pr-web.png',
      createdAt: 'Aug 3, 2022',
      website: 'PRWeb',
      title:
        'Footprint Emerges From Stealth to Create the Last Identity Form You Will Ever Fill Out',
      excerpt:
        'Footprint, a new company that allows companies with just five lines of code to frictionlessly and securely onboard users, launched today, with $6 million in Seed funding. The company wants to put peo...',
    },
  ];
  return { props: { articles } };
};

export default getStaticProps;
