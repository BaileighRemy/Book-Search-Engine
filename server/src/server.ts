import express, { Application } from 'express';
import cors from 'cors'; 
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from 'apollo-server-express'; 
import { typeDefs, resolvers } from './schemas/index.js'; 
import { authenticateToken } from './services/auth.js';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';


const app: Application = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  context: authenticateToken
});

// Apply Apollo middleware to the Express app
await server.start(); // Start the Apollo Server
server.applyMiddleware({ 
  app, 
  cors: {
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  },
 
}); // Apply Apollo middleware

// If we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`));
});