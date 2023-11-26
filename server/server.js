const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
// import ApolloServer and expressMiddleware
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

// import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// start Apollo server
const startApolloServer = async () => {
  await server.start();
};

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// apply middleware to the /graph endpoint
app.use('/graphql', expressMiddleware(server, {
  context: authMiddleware,
})
);

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});

// start Apollo server
startApolloServer();