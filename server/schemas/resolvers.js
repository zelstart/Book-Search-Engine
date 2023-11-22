// TODO: Define the query and mutation functionality to work with the Mongoose models.

const { User, Book } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        // get all users, populate their book data
        users: async () => {
            return User.find().populate('books');
          },
        // get a single user by username, populate their book data
        user: async (parent, { username }) => {
        return User.findOne({ username }).populate('books');
        },
        // get the currently logged in user and populate their book data
        me: async (parent, args, context) => {
            // check for the existence of a user in our context
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id})
                .select('-__v -password')
                .populate('books');
                // return the user's data
                return userData;
            }
            // if the user isn't logged in, throw an AuthenticationError
            throw new AuthenticationError('Not logged in!');
        },
    },

    Mutation: {
        // signup a user, taking in username, email and password as parameters. then, sign a token with the user's information and return the token and user.
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password});
            const token = signToken(user);
            return { token, user };
        },
        // login a user, taking in email and password as parameters. then, verify the user and return a token and user.
        login: async (parent, { email, password}) => {
            const user = await User.findOne({ email});

            if(!user) {
                throw new AuthenticationError('Incorrect credentials!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials!');
            }

            const token = signToken(user);
            return { token, user };
        }
    }
    
}


module.exports = resolvers;