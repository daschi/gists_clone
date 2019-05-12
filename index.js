const path = require('path')
const fs = require('fs-extra')

const { Client } = require('pg')
const client = new Client({ database: 'apis' })

const commands = require('./commands')
const queries = require('./queries')

async function main() {
  await client.connect();
  await commands.resetDb({client});

  const samson = await commands.createUser({
    client,
    email: 'fake@fake.com',
    password: 'ilovesamson',
    username: 'samson'
  })

  const samsonGist = await commands.createGist({
    client,
    user_id: samson.user_id,
    name: 'Gist Title',
    description: 'Testing out gists',
    private: false
  })

  const samsonFile = await commands.createFile({
    client,
    gist_id: samsonGist.gist_id,
    filename: 'example.js',
    content: 'This is all the contents of the new file',
    diff: 'This is all the contents of the new file'
  })

  const samsonRevision = await commands.createRevision({
    client,
    gist_id: samsonGist.gist_id,
    previous_id: null,
  })

  const samsonRevisionFile = await commands.createRevisionFile({
    client,
    revision_id: samsonRevision.revision_id,
    file_id: samsonFile.file_id,
  })

  await commands.updateGist({
    client,
    gist: samsonGist,
    lastRevision: samsonRevision,
    files: [
      {
        filename: 'example.js',
        content: 'This has changes to the file',
        diff: `-This is all the contents of the new file\n+This has changes to the file`
      },
      {
        filename: 'next_example.js',
        content: 'File 2 Content',
        diff: 'File 2 Content'
      }
    ]
  });

  return;
}

main().then(
  () => { process.exit(0) },
  (error) => {
    console.error(error);
    process.exit(1)
  }
)
