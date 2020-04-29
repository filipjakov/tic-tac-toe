import jwt from 'express-jwt';
import config from '../../config';

const isAuth = jwt({
  secret: config.jwtSecret as any, // The _secret_ to sign the JWTs
  userProperty: 'token', // Use req.token to store the JWT
  getToken: req => req.headers.authorization?.split(' ')[1], // How to extract the JWT from the request
});

export default isAuth;
