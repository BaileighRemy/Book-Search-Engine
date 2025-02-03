import express, { Application } from 'express';
import cors from 'cors'; 
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from 'apollo-server-express'; // Import ApolloServer
import { typeDefs, resolvers } from './schemas/index.js'; 

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*', // Allow requests from this origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create a new Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }), // Pass the request to the context
});

// Apply Apollo middleware to the Express app
await server.start(); // Start the Apollo Server
server.applyMiddleware({ 
  app, 
  cors: {
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }
}); // Apply Apollo middleware

// If we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`));
});