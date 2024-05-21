import type { GetStaticProps } from 'next';

import type { Article } from './media.types';

const getStaticProps: GetStaticProps = () => {
  const articles: Article[] = [
    {
      id: '14',
      url: 'https://www.businessinsider.com/footprint-pitch-deck-fintech-series-a-2024-5',
      website: 'Business Insider',
      imageUrl: '/media/business-insider-2.png',
      imageAlt: 'Footprint Pitch Deck',
      publishedAt: 'May 21, 2024',
      title:
        "Here's the pitch deck Footprint, a startup helping Wall Street verify customer identities, used to raise $13 million from VCs like QED and Index Ventures",
      excerpt:
        'Footprint raised $13 million in a Series A, announced today, that was led by QED Investors.',
    },
    {
      id: '13',
      url: 'https://www.qedinvestors.com/blog/why-qed-invested-in-footprint',
      website: 'QED Investors',
      imageUrl: '/media/qed.png',
      imageAlt: 'Footprint Raised 13M in Series A led by QED',
      publishedAt: 'May 21, 2024',
      title: 'Why QED invested in Footprint',
      excerpt:
        'QED invested in Footprint to help solve the problem of how to verify a person’s identity online.',
    },
    {
      id: '12',
      url: 'https://www.fintechinnovation50.com/',
      website: 'Fintech Innovation 50',
      imageUrl: '/media/fintech-innovation-50.png',
      imageAlt: 'Fintech Innovation 50',
      publishedAt: 'Jan 25, 2024',
      title: 'Footprint is in the Fintech Innovation 50 list for 2023',
      excerpt:
        'GGV Capital U.S. is excited to unveil the Fintech Innovation 50, an annual list highlighting the most innovative emerging and established fintech companies.',
    },
    {
      id: '11',
      url: 'https://whyyoushouldjoin.substack.com/p/inside-q1-24',
      website: 'Why You Should Join: Inside Edition',
      imageUrl: '/media/whyyoushouldjoin.png',
      imageAlt: 'Inside Q1 24',
      publishedAt: 'Jan 1, 2024',
      title:
        'Suggestions from Bogomil Balkansky (Sequoia), Shardul Shah (Index), Alex Kolicich (8VC), Ali Partovi and Suzanne Xie (Neo), and Arash Afrakhteh (Pear).',
      excerpt:
        '“Why You Should Join” is a monthly newsletter highlighting early-stage startups on track to becoming generational companies. Footprint was proudly featured in the January 2024 edition.',
    },
    {
      id: '10',
      url: 'https://www.primary.vc/firstedition/posts/focal-fintech-25-startups-to-watch',
      imageUrl: '/media/primary-vc.png',
      imageAlt: 'Focal Fintech: 25 Startups to Watch',
      publishedAt: 'Oct 19, 2023',
      website: 'Primary Ventures',
      title: 'Focal Fintech: 25 Startups to Watch',
      excerpt:
        "Meet NYC's up-and-coming startup leaders transforming financial services—from banking and payments to retirement planning.",
    },
    {
      id: '9',
      url: 'https://www.businessinsider.com/top-best-fintech-startups-according-to-vc-2023',
      imageUrl: '/media/business-insider.png',
      imageAlt: 'Top best fintech startups according to VC',
      publishedAt: 'Sept 5, 2023',
      website: 'Business Insider',
      title: 'Top best fintech startups according to VCs',
      excerpt:
        'After several tough quarters in the fintech space, VCs are still bullish on the sector, and Footprint is in the top startups to watch, according to VCs.',
    },
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
