import fs from 'fs-extra'
import path from 'path'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { v1 as neo4j } from 'neo4j-driver'
import { makeAugmentedSchema } from 'neo4j-graphql-js'
import dotenv from 'dotenv'
import http from 'http'
import PhotoScanner from './scanner/Scanner'
import _ from 'lodash'
import config from './config'

import { getUserFromToken, getTokenFromBearer } from './token'

// set environment variables from ../.env
dotenv.config()

const app = express()
app.use(bodyParser.json())
app.use(cors())

/*
 * Create an executable GraphQL schema object from GraphQL type definitions
 * including autogenerated queries and mutations.
 * Optionally a config object can be included to specify which types to include
 * in generated queries and/or mutations. Read more in the docs:
 * https://grandstack.io/docs/neo4j-graphql-js-api.html#makeaugmentedschemaoptions-graphqlschema
 */

const typeDefs = fs
  .readFileSync(
    process.env.GRAPHQL_SCHEMA || path.join(__dirname, 'schema.graphql')
  )
  .toString('utf-8')

import usersResolver from './resolvers/users'
import scannerResolver from './resolvers/scanner'
import photosResolver from './resolvers/photos'
import siteInfoResolver from './resolvers/siteInfo'

const resolvers = [
  usersResolver,
  scannerResolver,
  photosResolver,
  siteInfoResolver,
]

const schema = makeAugmentedSchema({
  typeDefs,
  config: {
    auth: {
      isAuthenticated: true,
      hasRole: true,
    },
    mutation: false,
    query: {
      exclude: [
        'ScannerResult',
        'AuthorizeResult',
        'Subscription',
        'PhotoURL',
        'SiteInfo',
      ],
    },
  },
  resolvers: resolvers.reduce((prev, curr) => _.merge(prev, curr), {}),
})

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'letmein'
  )
)

const scanner = new PhotoScanner(driver)

setInterval(scanner.scanAll, 1000 * 60 * 60 * 4)

// Specify port and path for GraphQL endpoint
const graphPath = '/graphql'

const endpointUrl = new URL(config.host)
// endpointUrl.port = process.env.GRAPHQL_LISTEN_PORT || 4001

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  context: async function({ req }) {
    let user = null
    let token = null

    if (req && req.headers.authorization) {
      token = getTokenFromBearer(req.headers.authorization)
      user = await getUserFromToken(token, driver)
    }

    return {
      ...req,
      driver,
      scanner,
      user,
      token,
      endpoint: endpointUrl.toString(),
    }
  },
  schema: schema,
  introspection: true,
  playground: true,
  subscriptions: {
    onConnect: async (connectionParams, webSocket) => {
      const token = getTokenFromBearer(connectionParams.Authorization)
      const user = await getUserFromToken(token, driver)

      return {
        token,
        user,
      }
    },
  },
})

server.applyMiddleware({ app, path: graphPath })

import loadImageRoutes from './routes/images'

loadImageRoutes({ app, driver, scanner })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(
  { port: process.env.GRAPHQL_LISTEN_PORT, path: graphPath },
  () => {
    console.log(
      `🚀 GraphQL endpoint ready at ${new URL(server.graphqlPath, endpointUrl)}`
    )

    let subscriptionUrl = new URL(endpointUrl)
    subscriptionUrl.protocol = 'ws'

    console.log(
      `🚀 Subscriptions ready at ${new URL(
        server.subscriptionsPath,
        endpointUrl
      )}`
    )
  }
)
