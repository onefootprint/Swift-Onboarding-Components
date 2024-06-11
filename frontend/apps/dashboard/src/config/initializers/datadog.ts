'use client';

import { datadogRum } from '@datadog/browser-rum';

/**
 * Currently, the official logger is part of the packages/idv project. In the future, we should have an independent/dedicated package for loggers.
 */

const IS_DDOG_ENABLED = process.env.NEXT_PUBLIC_IS_DDOG_ENABLED === 'true';
const APPLICATION_ID = process.env.NEXT_PUBLIC_DDOG_RUM_APPLICATION_DASHBOARD;
const CLIENT_TOKEN = process.env.NEXT_PUBLIC_DDOG_CLIENT_TOKEN_DASHBOARD;
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;
const GIT_COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const rumPercentage = Number(process.env.NEXT_PUBLIC_DDOG_RUM_PERCENTAGE);
const DDOG_RUM_PERCENTAGE = Number.isNaN(rumPercentage) || rumPercentage < 0 || rumPercentage > 100 ? 0 : rumPercentage;

const initDataDogRum = (): boolean => {
  if (process.env.NODE_ENV === 'test' || !IS_DDOG_ENABLED || !APPLICATION_ID || !CLIENT_TOKEN || !VERCEL_ENV) {
    return false;
  }

  datadogRum.init({
    applicationId: APPLICATION_ID, // The RUM application ID.
    clientToken: CLIENT_TOKEN, // Client tokens are unique to your organization.
    env: VERCEL_ENV,
    service: 'dashboard',
    site: 'datadoghq.com', // `site` refers to the Datadog site parameter of your organization. see https://docs.datadoghq.com/getting_started/site/
    version: `${VERCEL_ENV}:${GIT_COMMIT_SHA}`, // Specify a version number to identify the deployed version of your application in Datadog

    sessionSampleRate: 100,
    sessionReplaySampleRate: DDOG_RUM_PERCENTAGE,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  });
  return true;
};

export default initDataDogRum;
