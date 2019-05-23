const express = require('express');
const router = require('express-promise-router')();
const queries = require('../queries')
const commands = require('../commands')
const client = require('../db')
const helpers = require('./helpers')

// TODO:
// Add generated hash as Etag header for caching gists files
// Add authentication and autenticated routes for users to receive their own gists
// Add PUT / POST / DELETE endpoints

router.get('/gists', async (req, res) => {
  const { page = 1, limit = 5 } = req.query

  const gists = await queries.getGists({
    client,
    page,
    pageSize: limit
  })

  await Promise.all([
    helpers.getUsersForGists(gists),
    helpers.getPreviewForGists(gists)
  ])

  res.json({page, limit, gists})
})

router.get('/gists/:gist_id', async (req, res) => {
  const { gist_id } = req.params

  const gist = await queries.getGist({client, gist_id})

  await Promise.all([
    helpers.getUsersForGists([gist]),
    helpers.getCurrentGistFiles({gist, page: 1, pageSize: 5}),
    helpers.getCurrentFilesCount({gist})
  ])

  helpers.getFileURL(gist);

  res.json(gist)
})

// Add more error handling and responses for when
// delete, update, create succeed or fail

router.post('/gists', async (req, res) => {
  // add idempotency key in headers and add it to the
  // insert into query
  const { user_id, description, files, secret } = req.body

  // Wrap all of these in a transaction
  const gist = await commands.createGist({
    client,
    user_id,
    description,
    secret: secret === 'true'
  })

  const revision = await commands.createRevision({
    client,
    gist_id: gist.gist_id,
    previous_id: null
  })

  for (const file of files) {
    let newFile = await commands.createFile({
      client,
      filename: file.filename,
      content: file.content,
      diff: file.content
    })

    await commands.createRevisionFile({
      revision_id: revision.revision_id,
      file_id: newFile.file_id
    })
  }
})

router.put('/gists/:gist_id', async (req, res) => {
  const { gist_id } = req.params;
  const { description, files } = req.body;

  const gist = await queries.getGist({client, gist_id})

  // make this better
  if(gist.deleted_at) { throw new Error('Gist is deleted') }

  const revision = await commands.createRevision({
    client,
    gist_id: gist.gist_id,
    previous_id: gist.latest_revision_id
  })

  function _fileUpdated(file, newFile) {
    return file.content !== newFile.content ||
      file.filename !== newFile.filename
  }

  for (const file of files) {
    let nextFile;
    let existingFile;

    existingFile = await queries.getFile({
      client, file_id: file.file_id
    })

    if(_fileUpdated(existingFile, file) || !existingFile) {
      nextFile = await commands.createFile({
        client,
        filename: file.filename,
        content: file.content,
        diff: file.content
      })
    } else {
      nextFile = existingFile
    }

    await commands.createRevisionFile({
      revision_id: revision.revision_id,
      file_id: nextFile.file_id
    })
  }

})

router.delete('/gists/:gist_id', async (req, res) => {
  const { gist_id } = req.params;

  await commands.deleteGist({client, gist_id})
})

router.get('/gists/:gist_id/files', async (req, res) => {
  const { gist_id } = req.params;
  const { page = 1, limit = 5 } = req.query;

  const gist = await queries.getGist({client, gist_id})

  await Promise.all([
    helpers.getCurrentGistFiles({gist, page, pageSize: limit}),
    helpers.getCurrentFilesCount({gist})
  ])

  helpers.filesUrl(gist, page, limit);

  res.json({
    page,
    limit,
    files: gist.files,
    total_files: gist.total_files
  })
})

router.get('/files/:file_id', async (req, res) => {
  const { file_id } = req.params;
  // Add a revisions url to get paginated list of file revisions
  const file = await queries.getFile({client, file_id})

  res.json(file)
})

router.get('/files/:file_id/revisions', async (req, res) => {
  const { file_id } = req.params;
  const { page = 1, limit = 5 } = req.query;
  // Add revisions_url to get next page of revisions
  const file = await queries.getFile({client, file_id})
  // get file's revision_id
  const revision_id = file.revision_id
  // get revision's previous_id, recursively
  const revisions = await queries.getRevisionsByParentId({
    client,
    parent_id: revision_id
  })
  // order by created_at and file sequence

  res.json({file, revisions})
})

module.exports = router
