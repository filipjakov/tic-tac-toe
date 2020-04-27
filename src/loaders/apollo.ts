import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import schema from '../schema';
import { Application } from 'express';
import depthLimit from 'graphql-depth-limit';
import config from '../config';
import isAuth from '../api/middlewares/is-auth.middleware';
import attachUser from '../api/middlewares/attach-user.middleware';
import http from 'http';

export default async ({ app }: { app: Application }) => {
  const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(5)],
    playground: config.dev,
    // Previous middleware sets the user
    context: ({ req }) => {
      const user = (req as any).currentUser;

      if(!user) {
        throw new AuthenticationError('Can only access if signed-up!');
      }
      return { user };
    },
    subscriptions: {
      keepAlive: 1000,
      onConnect: async (connectionParams, websocket, context) => {
        console.log("WS Connected");
        return context;
      },
      onDisconnect: (websocket, context) => {
        console.log("WS Disconnected");
      }
    }
  });

  app.use(server.graphqlPath, isAuth);
  app.use(server.graphqlPath, attachUser);
  server.applyMiddleware({ app });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);


  httpServer.listen({ port: 5000 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:500${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:5000${
        server.subscriptionsPath
      }`
    );
  });
}
