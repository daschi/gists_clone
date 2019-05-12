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

  console.log({samson})

  const samsonGist = await commands.createGist({
    client,
    user_id: samson.user_id,
    name: 'Gist Title',
    description: 'Testing out gists',
    private: false
  })

  console.log({samsonGist})

  const samsonFile = await commands.createFile({
    client,
    gist_id: samsonGist.gist_id,
    filename: 'File Title',
    content: 'This is all the contents of the new file',
    diff: 'This is all the contents of the new file'
  })

  console.log({samsonFile})

  const samsonRevision = await commands.createRevision({
    client,
    gist_id: samsonGist.gist_id,
    previous_id: null,
  })

  console.log({samsonRevision})

  const samsonRevisionFile = await commands.createRevisionFile({
    client,
    revision_id: samsonRevision.revision_id,
    file_id: samsonFile.file_id,
  })

  console.log({samsonRevisionFile})
  return;
}

main().then(
  () => { process.exit(0) },
  (error) => {
    console.error(error);
    process.exit(1)
  }
)
