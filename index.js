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
    filename: 'File Title',
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

  await createNextRevisions({
    client,
    gist: samsonGist,
    revision: samsonRevision
  });

  return;
}

async function createNextRevisions({client, gist, revision}) {
  // User revises gist and edits file 1 and creates file 2
  const file_1 = await commands.createFile({
    client,
    gist_id: gist.gist_id,
    filename: 'File Title',
    content: 'This has changes to the file',
    diff: `-This is all the contents of the new file
           +This has changes to the file`
  })
  const file_2 = await commands.createFile({
    client,
    gist_id: gist.gist_id,
    filename: 'File 2 Title',
    content: 'File 2 Content',
    diff: 'File 2 Content'
  })
  const next_revision = await commands.createRevision({
    client,
    gist_id: gist.gist_id,
    previous_id: revision.revision_id,
  })

  // Create revision <-> files join table for new revision
  await commands.createRevisionFile({
    client,
    revision_id: next_revision.revision_id,
    file_id: file_1.file_id,
  })
  await commands.createRevisionFile({
    client,
    revision_id: next_revision.revision_id,
    file_id: file_2.file_id,
  })
}

main().then(
  () => { process.exit(0) },
  (error) => {
    console.error(error);
    process.exit(1)
  }
)
