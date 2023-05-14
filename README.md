# Site for my college football rankings.

Run `yarn` to install dependencies.

The app pulls one environment variable, `DATABASE_URL`, for the database connection. Set it in a `.env` file and NextJS will pick it up automatically.

Data is updated by a [scheduler](https://github.com/robby-barton/stats-go).

## Testing

### Local Dev
`yarn dev`

### Local Production (Docker)
Ensure you have a `.env` file with the `DATABASE_URL` set or else the build will fail.
```sh
# build the image locally
yarn docker:build

# run the local image
yarn docker:run
```