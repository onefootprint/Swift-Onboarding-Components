## Getting Started

Auth project has 2 routes

- `/`, The authentication flow, it can only be executed from within an iframe
  - Public configuration key is required
  - Initial bootstrap data is optional
- `/user` Enable users to update their email and phone number
  - Auth token is required

### Update flow token generation

Command to generate the token

```bash
curl -s https://api.dev.onefootprint.com/users/<fp_id_test_TOKEN>/token -X POST -d '{"kind": "user"}' -u sk_test_<TOKEN>: | jq
```

URL example to use the generated token

http://localhost:3011/user?variant=modal#tok_TOKEN

## Scripts

1. **build:analyze**

   - Description: Runs the build process with analysis enabled.
   - Command: `ANALYZE=true yarn build`

2. **build**

   - Description: Executes the internationalization (i18n) build process and then runs the Next.js build.
   - Command: `yarn i18n-build && next build`

3. **clean**

   - Description: Removes various generated and temporary directories and files, including Turbo, Next.js, node_modules, and localization files.
   - Command: `rm -rf .turbo && rm -rf .next && rm -rf node_modules && rm -rf ./public/locales/`

4. **dev**

   - Description: Initiates the i18n watch process and starts the Next.js development server on port 3011.
   - Command: `yarn i18n-watch & next dev -p 3011`

5. **format:fix**

   - Description: Formats TypeScript, TypeScript React, and Markdown files using Prettier with automatic fixes.
   - Command: `prettier --write "**/*.{ts,tsx,md}"`

6. **i18n-build**

   - Description: Builds both English and Spanish localization files.
   - Command: `yarn i18n-en && yarn i18n-es`

7. **i18n-en**

   - Description: Copies and watches English localization files from specific directories to the project's localization directory.
   - Command: `copy-and-watch --clean ../../packages/{ui,idv}/src/config/locales/en/*.json ./src/config/locales/en/*.json ./public/locales/en/`

8. **i18n-es**

   - Description: Copies and watches Spanish localization files from specific directories to the project's localization directory.
   - Command: `copy-and-watch --clean ../../packages/{ui,idv}/src/config/locales/es/*.json ./src/config/locales/es/*.json ./public/locales/es/`

9. **i18n-watch-en**

   - Description: Watches and updates English localization files during development.
   - Command: `copy-and-watch --clean --watch ../../packages/{ui,idv}/src/config/locales/en/*.json ./src/config/locales/en/*.json ./public/locales/en/`

10. **i18n-watch-es**

    - Description: Watches and updates Spanish localization files during development.
    - Command: `copy-and-watch --clean --watch ../../packages/{ui,idv}/src/config/locales/es/*.json ./src/config/locales/es/*.json ./public/locales/es/`

11. **i18n-watch**

    - Description: Initiates watch processes for both English and Spanish localization files.
    - Command: `yarn i18n-watch-en && yarn i18n-watch-es`

12. **lint:ci**

    - Description: Builds internationalization files and runs the Next.js linting process in a continuous integration (CI) environment.
    - Command: `yarn i18n-build && next lint`

13. **lint**

    - Description: Builds internationalization files and runs the Next.js linting process with automatic fixes.
    - Command: `yarn i18n-build && next lint --fix`

14. **set:dot-env**

    - Description: Executes a shell script to set up environment variables.

15. **start**

    - Description: Starts the Next.js production server on port 3011.
    - Command: `next start -p 3011`

16. **test:ci:bun**

    - Description: Builds English localization files and runs BUN tests with the option to bail on the first failure.
    - Command: `yarn i18n-en && bun test --bail`

17. **test:watch**

    - Description: Builds English localization files and runs BUN tests in watch mode.
    - Command: `yarn i18n-en && bun test --watch`

18. **test**

    - Description: Builds English localization files and runs BUN tests.
    - Command: `yarn i18n-en && bun test`

19. **typecheck**
    - Description: Builds internationalization files and performs TypeScript type checking without emitting files.
    - Command: `yarn i18n-build && yarn tsc --noEmit`

These are brief explanations of each script's purpose and the corresponding command to execute it. Adjustments can be made based on your specific project requirements.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
