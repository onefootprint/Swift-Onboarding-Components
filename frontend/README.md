# Footprint monorepo

## Setup

If you have a brand new computer, just run:

```
sh onboarding/setup.sh
```

This script will install all the dependencies required to run the project locally. After this, in order to install all the project npm modules, run:

```
yarn install
```

We only use `yarn`, so make sure to use it instead of `npm`.

### Structure

The monorepo is divided into two main folders:

- `apps`: any frontend application that someone could use, e.g dashboard, landing-page
- `packages`: internal and external modules, used across our apps, e.g design system, eslint/ts config

### Develop

To run a specific app, just run:

```
cd apps/desired-app
yarn dev
```

If you prefer, you can also run `yarn dev` from the root folder. This will run a development server for each app we have.

### Ports

The last command described above, `yarn dev`, will try to bootstrap a new server using an available port. To have more predictability, as well as
to enforce more constraints on WebAuthn, each app has its own port:

| App                           | Port |
| ----------------------------- | ---- |
| Bifrost                       | 3000 |
| Dashboard                     | 3001 |
| Demo                          | 3002 |
| Frontpage                     | 3003 |
| My One Footprint              | 3004 |
| Biometric                     | 3005 |
| Email Verification            | 3006 |
| UI Docs - Storybook           | 3007 |
| Footprint UI Docs - Storybook | 3007 |

### Build

To build a specific app, run the following command:

```
cd apps/desired-app
yarn build
```

If you prefer, you can also run `yarn build` from the root folder. This will build all the apps.

### Remote Caching

Turborepo can use a technique known as [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching (Beta) you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/features/pipelines)
- [Caching](https://turborepo.org/docs/features/caching)
- [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/features/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)
