Resources and Basic Actions:
  gists - GET
  gist - GET, POST, PUT, DELETE
  revisions - GET
  subscriptions - GET

GET /gists + pagination query params
{
  page: integer,
  offset: integer,
  limit: integer,
  gists: array [
    gist {
      user: {
        username: string,
        avatar_url: string  
      },
      stars_count: integer,
      comments_count: integer,
      name: string,
      description: string,
      created_at, <!-- comes from the revisions model -->
      files: {
        url: string, <!-- link to paginated files endpoint -->
        count: integer,
        total: integer,
        filename: string,
        content: string
      }
    }
  ]
}
GET /gists/:gist_id
  {
    user: {
      username: string,
      avatar_url: string  
    },
    stars_count: integer,
    comments_count: integer,
    name: string,
    description: string,
    created_at, <!-- comes from the revisions model -->
    files: array [
      {
        url: string, <!-- link to paginated files endpoint -->
        count: integer,
        total: integer,
        filename: string,
        content: string
      }
    ]
  }
GET /gists/:gist_id/files + pagination query params
  {
    page: integer,
    offset: integer,
    limit: integer,
    files: array [
      {
        url: string, <!-- link to paginated files endpoint -->
        count: integer,
        total: integer,
        filename: string,
        content: string
      }
    ]
  }
GET /gists/:gist_id/files/:file_id
  {
    filename: string,
    content: string
  }

GET /gists/:gist_id/revisions + pagination query params
GET /gists/:gist_id/revisions/:revision_id + pagination query params  
GET /gists/:gist_id/revisions/:revision_id/files/:file_id

POST /gists/:gist_id
POST /gists/:gist_id/files/:file_id

PUT /gists/:gist_id
PUT /gists/:gist_id/files/:file_id

DELETE /gists/:gist_id
DELETE /gists/:gist_id/files/:file_id


Specify the attributes of each resource. If the resource corresponds closely to an entity in your logical model or a table in your schema, which subset of attributes/columns should be exposed? If the attributes are new, how will they be derived from your data? What are the types? Do the attributes used to create or update an instance of a resource match those retrieved? Which of these are optional or required?
