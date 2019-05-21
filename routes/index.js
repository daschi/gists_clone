const express = require('express');
const router = require('express-promise-router')();
const queries = require('../queries')
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
