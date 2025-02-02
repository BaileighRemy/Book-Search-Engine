import User from '../models/User.js'; // Import your User model
import { signToken, AuthenticationError } from '../services/auth.js'; // Import signToken function

// Define types for the arguments
interface LoginArgs {
  email: string;
  password: string;
}

interface AddUserArgs {
  username: string;
  email: string;
  password: string;
}

interface SaveBookArgs {
  authors: string[];
  description: string;
  title: string;
  bookId: string;
  image: string;
  link: string;
}

interface RemoveBookArgs {
  bookId: string;
}

// Define the context type
interface Context {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      // Assuming context contains the authenticated user
      if (context.user) {
        return User.findById(context.user._id);
      }
      throw new AuthenticationError('Not authenticated');
    },
  },
  Mutation: {
    login: async (_parent: unknown, { email, password }: LoginArgs) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Wrong password!');
      }
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },
    addUser: async (_parent: unknown, { username, email, password }: AddUserArgs) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },
    saveBook: async (_parent: unknown, { authors, description, title, bookId, image, link }: SaveBookArgs, context: Context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: { authors, description, title, bookId, image, link } } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('Not authenticated');
    },
    removeBook: async (_parent: unknown, { bookId }: RemoveBookArgs, context: Context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('Not authenticated');
    },
  },
};

export default resolvers;