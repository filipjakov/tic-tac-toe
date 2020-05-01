# Tic-Tac-Toe
🚀 Superpowered tic-tac-toe with Node.js+TypeScript+GraphQL 🚀

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Technical requirements:

- [x] TypeScript must be used
- [x] GraphQL must be used
- [x] some sort of DI must be used

## API requirements:

- [x] create a new game (single/multi)
- [x] join an existing game (with id provided when new game was created)
- [x] make a new move
- [x] get live results via subscription (for a game)
- [x] get history for a game by id

## How to run the project

1. Clone repo locally
2. Enter project, run `npm i`
3. There are three options at this point:
  - running **development** "build": run either `npm run start:dev` or `npm run start:dev_verbose` (contains verbose logs from express)
  - running **production** "build": run `npm run build` and then `npm run start`
  - if using vscode, running the debugger (configuration in `launch.json`) will start the server with the possibility of debugging

NOTES:
- `ts-node` is used to "directly" run dev/debugg mode alongside with `nodemon` listening to file changes

## Architecture

```
src
|-- api               # Express route controllers for all endpoints of the app 
|-- config            # Environment variables and configuration
|-- abstracts         # TS specific abstracts (containing interfaces, types, enums...)
|-- loaders           # Startup process split into modules (server, logger, db...)
|-- models            # Database models
|-- schema            # GraphQL schema
|-- services          # Business logic
|-- utils             # Various utils
    resolverMap.ts    # Resolvers
    schema.ts         # Loading types and resolvers
    server.ts         # Entry point for the server
```

Most of file structure revolves around the express server dynamics (the addition of GraphQL a bit breaks that structure, but the point is still obvious). The idea is to use the principle of separation of concerns to move the business logic away from the node.js API Routes. Some of the interesting parts:

1. `server.ts` is the entry point of the app. Here the startup process was split into **"modules"** (`loaders`). It reduces the mess of having it all in the entry file. The modules are tiny files with concise purpose and can do stuff like loading a database connection, loading the server itself, creating some logging utility, bootstraping the graphql server... `api` folder contains all the express specifics (routes, middleware, ...) that get loaded in its loader.

2. `typedi` is used in order to bring some notion of **DI** to the procject. By doing this, one gains the flexibility to inject a 'compatible dependency' when writing  unit tests for the service, or when the service is used in another context. A pretty nifty way to extract and not tightly couple business logic with the rest of the app. An example is setting the database connection to a token (`loader/typeorm.ts` loader) so it can then be reused in the services (to fetch needed entities).

3. `config` folder contains logic for extraction of the **environment variables** (`.env` with `dotenv`). This way we can avoid flooding our code with `process.env.MY_RANDOM_VAR`. We also get autocompletion 🎉!

4. `abstracts` folder contains TS specific stuff like **types**, **interfaces** or even **enums**.

5. `models` contains database models. **TypeORM** was used in the project -> the database loader specifies a `sqlite:memory` database. Its connection is exposed as a DI token for services to inject.

6. `services` folder contains all the specific business logic separated by "domains" and exposed as services (annotated classes).

7. `utils/custom-error.ts` exposes a custom error and a mapper function. The idea is to move the services away from the notion of GraphQL. Once propagated to the "graphql router" layer, errors get mapped to specific GrapQL errors.

8. `schema/schema.graphql;resolverMap.ts;schema.ts` and the `loader/apollo.ts` loader contain the GrapQL specifics -> a post and subscription endpoint will be raised on the defined port (from the config)

## Flows

Before any type of game is started, a user/player must "sign-up". A jwt is generated on the provided name. IF successfully decoded, (with the extracted user id) a user gets fetched from the db and attached to the request or to the context (apollo). That is done in the following way:

- a request must be made to `/auth/signup` and `name` property must be defined in the body of the request (`application/json`)
- a token will be recieved as a response
- (if using **GraphQL Playground**) the token must be pasted in the **HTTP HEADERS** (bottom left, near **QUERY VARIABLES**) section in the following manner (to do either queries, mutations, or subscriptions):

```json
{
  "Authorization": "Bearer <your-token>"
}
```

- if you want to check info about your user/player, ping `/users/me` with the token set in the headers

1. Creating a game:

- user sends the type of the game (`schema.graphql` -> `GameType`)
- if the game is single-player, the bot gets either created or fetched from the db (as a player) and is added to the game
- if the game is multiplayer, no move is allowed until the other player joins
- **the creator of the game makes the first move**

2. Joining a game:

- player sends the id of the game he wants to join
- a player can't join:
  - a non existing game
  - a done game (somebody won or tied)
  - a single-player game
  - an already populated game (2 players)
  - a game he already participates in
- after the player joins the game, moves can be made
- the player who created the game makes the first move

3. Making moves:

- player sends the id of the game and the type of move he wants to make (`schema.graphql` -> `MoveType`)
- a player can't make a move if:
  - there is no game for the provided id
  - the player does not belong to the game
  - a game is done (somebody won or tied)
  - if still waiting for other player to join
  - if provided move was already made
  - if it's not the player's turn
- quirks:
  - after every move, the status of the game gets checked (to further optimize, checking after the 5th move could be a better solution)
  - player can only make a move if the game has its ID as the currentPlayer
  - a game is **WON** if the status of that game is DONE and the winner populates the currentPlayer field
  - after every move of the player (in a single player game), the bot schedules its move to be made after the mutation response of the user was returned. Its move is calculated to pick a random field that is left from the currently made moves

4. Listening to game changes/moves (**subscription**):

- after a mutation is made (new move), the updated game gets sent via subscriptions to all the listeners
- by providing the gameId on the Subscription of interest (`game(id:$id)`), the listener gets the `Game` object everytime it gets updated (a move is made)

## APIs
(check schema for further info)

1. Queries:
  1. Get user by id
  2. Get all users
  3. Get game by id
  4. Get all games

2. Mutations:
  1. Create game with provided type
  2. Join game with provided id
  3. Make a move for game (with provided id)

3. Subscriptions:
  1. Get the whole game state on every move change

4. Express Router APIs:
  1. `/auth/signup` - generate token and save user for provided user name
  2. `/users/me` - get information about the user with correct token set in the header

## Remarks

- [x] for single player, AI moves can be random (better implementation is a plus) -> currently implemented as random
- [x] usage of database is not needed (but make a system where it can be easily added in the future) - `TypeORM`+ `sqlite:memory`
- [x] try to create a meaningful logging system -> `winston`
