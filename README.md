## Project setup

1. Install dependencies
```bash
$ npm ci
```

2. Set up environment variables
```bash
$ cp .env.sample .env
```


## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# inside the container
$ docker compose up
```

## Architecture

![architecture.png](architecture.png)
