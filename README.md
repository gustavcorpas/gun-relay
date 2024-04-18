# GunPlus Relay
This is a gun relay using [GunPlus](https://github.com/gustavcorpas/gun-plus).
The relay is intended to be simple and extendable with plugins.

The relay is written in typescript.

### Running the relay
The relay can be installed by running: 
`git clone https://github.com/gustavcorpas/gun-plus-relay.git`

To setup the relay do with the correct settings do:
`npm run setup`;
This will generate a `relay-config.json` file with the selected settings.

To run the relay do:
`npm run start` 

### Testing the relay
Running the relay in `dev` mode will put a timestamp on the graph every couple of seconds. You can use this to validate that the relay is running as expected. Some plugins may also have different settings and logging to help you validate that everything is working as expected.

To run in developer mode do:
`npm run dev` 

### Deploying with Docker
The gun relay ships with a docker file. You can use this to deploy with docker.
From the root directory do the following.

- **Build the image**: `docker build -t gun-relay .`
- **Run the image** `docker run -dp 127.0.0.1:3000:3000 --name gr-1 gun-relay`

*OBS: if you change the port from default `3000` you will need to change what port is exposed in the `Dockerfile`.*

docker run -d \
    -p 127.0.0.1:$port:$port \
    --env-file "$(pwd)/$dirname/.env" \
    --mount type=bind,src="$(pwd)/$dirname/config.json",target=/app/config.json \
    --name "$clientname" peershare-tabs


# Plugins

There are a number of plugins available. See below.
Plugins may have a certain number of parameters that can be specified in the `relay-config.json` file. Default values are provided.

*All plugins must be started by doing `plugin.start()` for them to start working.
If you are building your own plugins, make sure they implement the `IPlugin` interface found in  `./src/models/plugin.ts` file.*

## Janitor
The janitor plugin will clean out the radata folder, i.e. the gun database, if it exceeds a certain number of giga bytes. The janitor plugin will run a check every x minutes, if it needs to clean the database.

**Default production settings**
```json
"janitor": {
	"enabled": false,
	"max-capacity-gb": 4,
	"timer-minutes": 60
}
```
*OBS: In dev mode the janitor cleans and checks very often to help you debug.* 

## Bullet-catcher

*The implementation of this plugin is based on Geir Gåsodden's bullet-catcher module which can be found [here](https://github.com/zrrrzzt/bullet-catcher).*

Restrict `put` operations so only messages that have a specific token will be stored by the relay.

**Default production settings**
```json
"bullet-catcher": {
	"enabled": false,
	"token": "example-token",
}
```