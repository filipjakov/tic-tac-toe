import apolloLoader from './apollo';
import expressLoader from './express';
import Logger from './logger';
import typeORMLoader from './typeorm';

export default async ({ app }: { app: any }) => {
  await typeORMLoader();
  Logger.info('ORM loaded!');

  await expressLoader({ app })
  Logger.info('Express loaded!');

  await apolloLoader({ app });
  Logger.info('Apollo loaded!');

  Logger.info('Everything loaded, setup done!');
};
