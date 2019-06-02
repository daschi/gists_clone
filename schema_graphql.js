const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
} = require('graphql')

const queries = require('./queries')
const commands = require('./commands')
const client = require('./db')

const FileType = new GraphQLObjectType({
  name: 'File',
  fields: {
    file_id: { type: GraphQLString },
    filename: { type: GraphQLString },
    content: { type: GraphQLString },
  }
})

const GistType = new GraphQLObjectType({
  name: 'Gist',
  fields: {
    gist_id: { type: GraphQLString },
    user_id: { type: GraphQLString },
    description: { type: GraphQLString },
    secret: { type: GraphQLBoolean },
    latest_revision_id: { type: GraphQLString },
    files: {
      type: new GraphQLList(FileType),
      async resolve(gist, args) {
        return await queries.getCurrentGistFiles({
          client,
          revision_id: gist.latest_revision_id,
          page: args.page,
          limit: args.limit
        })
      }
    }
  }
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createGist: {
      type: GistType,
      args: {
        user_id: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        secret: { type: GraphQLBoolean },
      },
      async resolve(root, args) {
        console.log({args})
        return await commands.createGist({client, ...args})
      }
    }
  }
})

const query = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    gist: {
      type: GistType,
      args: {
        gist_id: { type: GraphQLString }
      },
      async resolve(root, args) {
        return await queries.getGist({client, gist_id: args.gist_id})
      }
    },
    gists: {
      type: new GraphQLList(GistType),
      args: {
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt }
      },
      async resolve(root, args) {
        return await queries.getGists({client, page: args.page, limit: args.limit})
      }
    }
  },
})

module.exports = new GraphQLSchema({ query, mutation })
