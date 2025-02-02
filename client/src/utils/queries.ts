import { gql } from '@apollo/client';

interface Book {
  bookId: string;
  authors: string[];
  description: string;
  title: string;
  image: string;
  link: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  savedBooks: Book[];
}

export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;

// Define the type for the query result
export type GetMeResponse = {
  me: User;
};