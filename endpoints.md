Resources and Basic Actions:
  gists - GET
  gist - GET, POST, PUT, DELETE
  revisions - GET
  subscriptions - GET

GET /gists + pagination query params
{
  page: integer,
  limit: integer,
  gists: [
    {
      gist_id: uuid,
      user_id: uuid,
      name: string,
      description: string,
      latest_revision_id: uuid,
      created_at,
      user: {
        user_id: uuid,
        email: string,
        username: string,
        avatar_url: string  
      },
      file: {
        filename: string,
        content: string,
        revision_id: uuid
      }
    }
  ]
}
GET /gists/:gist_id
  {
    gist_id: uuid,
    user_id: uuid,
    name: string,
    description: string,
    stars_count: integer,
    comments_count: integer,
    created_at,
    user: {
      user_id: uuid,
      email: string,
      username: string,
      avatar_url: string  
    },
    total_files: integer,
    files_url: string,
    files: [{ filename: string, content: string }]
  }
GET /gists/:gist_id/files + pagination query params
  {
    page: integer,
    limit: integer,
    files: {
      files_url: string, <!-- link to paginated files endpoint -->
      total: integer,
      files: [{ filename: string, content: string }]
    ]
  }
GET /gists/:gist_id/files/:file_id
  {
    filename: string,
    content: string
  }

GET /files/:file_id/revisions
{
  file: {
    file_id: uuid,
    filename: string,
    content: string,
    created_at: timestamp,
    revision_id: uuid
  },
  totalRevisions: integer,
  revisions: [
    {
      revision_id: uuid,
      previous_id: uuid,
      gist_id: uuid,
      created_at: timestamp
    },
    {
      revision_id: uuid,
      previous_id: uuid,
      gist_id: uuid,
      created_at: timestamp
    }
  ]
}
GET /gists/:gist_id/revisions + pagination query params
GET /gists/:gist_id/revisions/:revision_id + pagination query params  
GET /gists/:gist_id/revisions/:revision_id/files/:file_id

POST /gists/(:gist_id) - idempotency key in header
POST /gists/:gist_id/files/(:file_id) - idempotency key

PUT /gists/:gist_id
PUT /gists/:gist_id/files/:file_id

DELETE /gists/:gist_id
DELETE /gists/:gist_id/files/:file_id
