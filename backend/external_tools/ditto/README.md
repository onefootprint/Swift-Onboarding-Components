# Ditto
A simple web server that responds with the headers and body you send to it.
Useful for testing proxy-related functionality for internal use and as a developer debug tool for our users.

## Deployment
### Via fly
```sh
# deploys to fly.io (must have auth, ask alex for invitations)
fly deploy .
```

Eventually we should add this as a service in /backend/infra but for now we just deploy on Fly.io since it's a trivial service.