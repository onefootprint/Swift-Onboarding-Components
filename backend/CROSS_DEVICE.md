# Cross device testing with HTTPS

Footprint's flows are not only highly-optimized for mobile, but also support context switching "desktop-to-phone" transitions to do liveness/biometrics. Therefore while doing local dev it's important to be able to test on mobile against a locally running webserver (frontend & backend!).

For webauthn to work, if not on localhost, the address needs to be TLS.

## Using Ngrok (recommended)

1. Install ngrok (https://ngrok.com/download)
2. Get an Auth token from Alex
3. `ngrok config add-authtoken <token>`

### Tunnels

Open a tunnel: `ngrok http <PORT> --hostname=<service>-<common_name>.local.footprint.dev`

- replace `<PORT>` with your intended localhost port
- replace `<service>` with the app (like `bifrost` or `backend`)
- `<common_name>` is a fixed string like `alex`

This proxies any traffic to `https://<service>-<common_name>.local.footprint.dev` TO `localhost:<PORT>`.

Example:
`ngrok http 3000 --hostname=bifrost-ag.local.footprint.dev`

**Important**: Please be sure to common_name any tunnel with some personal string like your name ("alex") or initials "ag", so we don't clobber each other's testing tunnels.

### Remote Backend

Since the domain is on \*.local.footprint.dev, webauthn registrations will work as expecting if you set your API base url to `https://api.dev.infra.footprint.dev`.

### With a local Backend

You can also use ngrok to test a locally running backend server.

1. `$ export RELYING_PARTY_ID=local.footprint.dev`
2. Start the backend as you normally do, `make run-local`
3. Open a tunnel: `ngrok http 8000 --hostname=api-<your_name>.local.footprint.dev`

### Example

Backend (deployed version): `api.dev.infra.footprint.dev`
Frontend (bifrost): `ngrok http 3000 --hostname=bifrost-ag.local.footprint.dev`
Frontend (d2p): `ngrok http 3005 --hostname=d2p-ag.local.footprint.dev`

## Using Tailscale (alternative)

### Setup

1. Ensure you have access to [Tailscale](https://login.tailscale.com/login?provider=google)
2. Install Tailscale on your mac and log in
3. Install Tailscale on your mobile device and log in
4. Ensure Tailscale is turned ON for both devices
5. Note your machine name, like `alexs-macbook-pro`
6. In the Tailscale menubar icon on mac, ensure "Preferences > Allow incoming network connections" is ON

### Setup certificates + local proxy

1. Setup `./tls_proxy/setup.sh`
2. Make any modifications to `tls_proxy/local_proxy.json` (for port mappings!)

### Backend: set the domain

1. `$ export RELYING_PARTY_ID=tuxedo-bull.ts.net`
2. Start the backend as you normally do, `make run-local`

### Frontend

1. Configure your local env to set the api server as `https://<your-machine-name>.tuxedo-bull.ts.net:<PORT>`
2. Start the frontend as your normally do, `yarn dev`

### Example

For example, say your frontend runs on `localhost:3000` and backend `localhost:8000`.

With the above config, you will now be able to reach your frontend @ `http://alexs-macbook-pro.tuxedo-bull.ts.net:4431` and backend at `http://alexs-macbook-pro.tuxedo-bull.ts.net` BOTH on your mobile device and your mac :)
