/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import React from 'react';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantLogoUrl = searchParams.get('logo_url');
  if (!tenantLogoUrl) {
    return new ImageResponse(<>Missing tenantLogoUrl</>, {
      width: 1200,
      height: 630,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url(/background-og.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          gap: 86,
        }}
      >
        <div
          style={{
            padding: 12,
            background: 'white',
            borderRadius: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              '0px 4px 4px rgba(0, 0, 0, 0.04), 0px 6px 16px rgba(0, 0, 0, 0.12)',
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M75.0012 71.25H89.998V57.9762C87.792 59.2553 85.2338 60 82.4984 60C74.215 60 67.5004 53.2842 67.5004 45.0008C67.5004 36.7162 74.215 29.9992 82.4984 29.9992C85.2338 29.9992 87.792 30.7439 89.998 32.023V15H30V105H56.2492V90.0008C56.2492 79.6447 64.6439 71.25 75.0012 71.25Z"
              fill="black"
            />
          </svg>
        </div>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21C11.699 20.9996 11.405 20.9086 11.1563 20.7389C7.47238 18.2381 5.87722 16.5234 4.99738 15.4514C3.12238 13.1663 2.22472 10.8202 2.25003 8.27953C2.27956 5.36813 4.61534 3 7.45691 3C9.52316 3 10.9543 4.16391 11.7877 5.13328C11.8141 5.16368 11.8467 5.18805 11.8833 5.20476C11.92 5.22146 11.9598 5.23011 12 5.23011C12.0403 5.23011 12.0801 5.22146 12.1167 5.20476C12.1534 5.18805 12.186 5.16368 12.2124 5.13328C13.0458 4.16297 14.4769 3 16.5432 3C19.3847 3 21.7205 5.36812 21.75 8.28C21.7753 10.8211 20.8767 13.1672 19.0027 15.4519C18.1228 16.5239 16.5277 18.2386 12.8438 20.7394C12.5951 20.9089 12.3011 20.9998 12 21Z"
            fill="#0E1438"
          />
        </svg>
        <div
          style={{
            background: 'white',
            borderRadius: 100,
            display: 'flex',
            padding: '24px',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              '0px 4px 4px rgba(0, 0, 0, 0.04), 0px 6px 16px rgba(0, 0, 0, 0.12)',
          }}
        >
          <img height="104" width="104" src={tenantLogoUrl} alt="Tenant Logo" />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
    },
  );
}
