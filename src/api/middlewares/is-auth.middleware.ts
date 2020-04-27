import jwt from 'express-jwt';
import config from '../../config';

/**
 * We are assuming that the JWT will come in a header with the form
 *
 * Authorization: Bearer ${JWT}
 */
const isAuth = jwt({
  secret: config.jwtSecret as any, // The _secret_ to sign the JWTs
  userProperty: 'token', // Use req.token to store the JWT
  getToken: (req: any) => req.headers.authorization?.split(' ')[1], // How to extract the JWT from the request
});

export default isAuth;
