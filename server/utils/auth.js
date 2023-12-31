const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  }),

  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // if no token throw error
    if (!token) {
      throw new Error('You have no token!');
    }

    // verify token and get user data out of it
    try {
      const { user } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = user;
    } catch {
      console.log('Invalid token');
    }
    
    // return updated request object
    return req;
  },

  // generate token
signToken: function ({ email, username, _id }) {
  const payload = { email, username, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
},
};