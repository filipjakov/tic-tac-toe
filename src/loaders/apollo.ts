import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { Application } from 'express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import Container from 'typedi';
import config from '../config';
import schema from '../schema';
import AuthService from '../services/auth.service';

export default async ({ app }: { app: Application }) => {
  const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(5)],
    playground: config.dev,
    introspection: config.dev,
    debug: config.dev,
    context: async ({ req, connection }) => {
      // WS auth
      if (connection) {
        return connection.context;
      }

      // HTTP Auth
      const token = req.headers.authorization?.split(' ')[1] as string;
      const player = await Container.get(AuthService).findUser(token);

      if (!player) {
        throw new AuthenticationError(`Can't parse token! Please sign-up!`)
      }
      return { player };
    },
    subscriptions: {
      keepAlive: 1000,
      onConnect: async (connectionParams) => {
        console.log("WS Connected");
        // TODO: extract token in a better manner, Authorization field is not a good option
        const token = (connectionParams as any).Authorization?.split(' ')[1];
        const player = await Container.get(AuthService).findUser(token);

        if (!player) {
          throw new AuthenticationError(`Can't parse token! Please sign-up!`)
        }
        return { player };
      },
      onDisconnect: (_, context) => {
        console.log("WS Disconnected");
      },
      path: '/subscriptions'
    }
  });

  server.applyMiddleware({ app });

  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`HTTP Server ready at http://localhost:${config.port}${server.graphqlPath}`);
    console.log(`Subscriptions ready at ws://localhost:${config.port}${server.subscriptionsPath}`);
  });
}
