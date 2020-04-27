import { IResolvers } from 'graphql-tools';

const resolverMap: IResolvers = {
  Query: {
    helloWorld(): string {
      return `👋 Hello world! 👋`;
    },
  },
};

export default resolverMap;
