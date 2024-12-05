# POS app

## Local testing

```sh
yarn install
REACT_APP_FP_API_URL=https://api.onefootprint.com/ yarn dev
```

## Docker

```sh
docker build -t pos-app .
docker run -p 3000:80 -e APP_FP_API_URL=https://api.onefootprint.com pos-app
```