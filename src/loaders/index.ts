import expressLoader from './express';
import apolloLoader from './apollo';
import typeORMLoader from './typeorm';

export default async ({ app }: { app: any }) => {
  await typeORMLoader();
  console.log('ORM loaded!');

  await expressLoader({ app })
  console.log('Express loaded!');

  await apolloLoader({ app });
  console.log('Apollo loaded!');

  console.log('Everything loaded');
};
