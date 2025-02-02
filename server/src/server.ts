import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from 'apollo-server-express'; // Import ApolloServer
import { typeDefs, resolvers } from './models'; // Import your typeDefs and resolvers

const app = express();
const PORT = process.env.PORT || 3001;

// Create a new Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Apply Apollo middleware to the Express app
await server.start(); // Start the Apollo Server
server.applyMiddleware({ app }); // Apply Apollo middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// If we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`));
});