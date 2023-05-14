# Site for my college football rankings.

Data is updated by a [scheduler](https://github.com/robby-barton/stats-go).

## Testing

Run `yarn` to install dependencies.

Ensure you have a `.env` file with the `DEV_DATABASE_URL` set for the database to test against.

### Local Dev

`yarn dev`

### Local Production (Docker)
```sh
# build the image locally
yarn docker:build

# run the local image
yarn docker:run
```