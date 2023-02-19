const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');



// Initialize a PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres9596',
    port: 5432
});



// Define the GraphQL schema
const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        email: String!
    }
  
    type Query {
        users: [User!]
        user(id: ID!): User
    }
  
    input UserInput {
        id: ID!
        name: String!
        email: String!
    }
  
    type Mutation {
        createUser(input: UserInput!): User
        updateUser(input: UserInput!): User
        deleteUser(id: ID!): User
    }
`;



// Define the resolvers that will handle the GraphQL queries and mutations
const resolvers = {
    Query: {
        async users() {
            const { rows } = await pool.query('SELECT * FROM users');
            return rows;
        },
        async user(_, { id }) {
            const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            return rows[0];
        },
    },
    Mutation: {
        async createUser(_, { input }) {
            const { id, name, email } = input;
            const { rows } = await pool.query('INSERT INTO users(id, name, email) VALUES($1, $2, $3) RETURNING *', [id, name, email]);
            return rows[0];
        },
        async updateUser(_, { input }) {
            const { id, name, email } = input;
            const { rows } = await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
            return rows[0];
        },
        async deleteUser(_, { id }) {
            const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
            return rows[0];
        },
    }
};



// Initialize the Apollo Server with the schema and resolvers
const server = new ApolloServer({
    typeDefs,
    resolvers
});



// Start the server
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});