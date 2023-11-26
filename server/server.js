const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const cors = require('cors')

const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const routes = require('./routes');
const { authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

// start Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  cors: {
    origin: '*', // Allow all origins
    credentials: true // Credentials are allowed
  }
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server));
  app.use(routes);

  app.use(cors());

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// start Apollo server
startApolloServer();