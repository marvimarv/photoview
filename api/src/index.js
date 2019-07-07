import { typeDefs } from "./graphql-schema";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import bodyParser from "body-parser"
import { v1 as neo4j } from "neo4j-driver";
import { makeAugmentedSchema } from "neo4j-graphql-js";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken'
import uuid from 'uuid'

// set environment variables from ../.env
dotenv.config();

const app = express();
app.use(bodyParser.json())

/*
 * Create an executable GraphQL schema object from GraphQL type definitions
 * including autogenerated queries and mutations.
 * Optionally a config object can be included to specify which types to include
 * in generated queries and/or mutations. Read more in the docs:
 * https://grandstack.io/docs/neo4j-graphql-js-api.html#makeaugmentedschemaoptions-graphqlschema
 */

const schema = makeAugmentedSchema({
  typeDefs,
  config: {
    auth: {
      isAuthenticated: true,
      hasRole: true
    },
    mutation: false
  },
  resolvers: {
    Mutation: {
      async authorizeUser(root, args, ctx, info) {
        let {username, password} = args

        let session = ctx.driver.session()

        let result = await session.run("MATCH (usr:User {username: {username}, password: {password} }) RETURN usr.id", {username, password})

        if (result.records.length == 0) {
          return {
            success: false,
            status: "Username or password was invalid",
            token: null
          }
        }

        const record = result.records[0]

        const userId = record.get('usr.id')

        const token = jwt.sign({id: userId}, process.env.JWT_SECRET)

        return {
          success: true,
          status: "Authorized",
          token
        }
      },
      async registerUser(root, args, ctx, info) {

        let {username, password} = args

        let session = ctx.driver.session()
        let result = await session.run("MATCH (usr:User {username: {username} }) RETURN usr", {username})

        if (result.records.length > 0) {
          return {
            success: false,
            status: "Username is already taken",
            token: null
          }
        }

        await session.run("CREATE (n:User { username: {username}, password: {password}, id: {id} }) return n", {username, password, id: uuid()})

        session.close()

        return {
          success: true,
          status: "User created",
          token: "yay"
        }
      }
    }
  }
});

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "letmein"
  )
);

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  context: ({ req }) => Object.assign(req, {driver}),
  schema: schema,
  introspection: true,
  playground: true
});

// Specify port and path for GraphQL endpoint
const port = process.env.GRAPHQL_LISTEN_PORT || 4001;
const path = "/graphql";

/*
* Optionally, apply Express middleware for authentication, etc
* This also also allows us to specify a path for the GraphQL endpoint
*/
server.applyMiddleware({app, path});

app.listen({port, path}, () => {
  console.log(`GraphQL server ready at http://localhost:${port}${path}`);
});
