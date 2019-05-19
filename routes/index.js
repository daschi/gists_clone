const express = require('express');
const router = require('express-promise-router')();
const queries = require('../queries')
const client = require('../db')
const {offset} = require('../queries/helpers')
const helpers = require('./helpers')

// TODO:
// Add Etag header
// Add authentication
// Add authenticed routes for gists

router.get('/', async (req, res) => {
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

  res.json({page, limit, offset: offset(page, limit), gists})
})

router.get('/:gist_id', async (req, res) => {
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

router.get('/:gist_id/files', async (req, res) => {
  const { gist_id } = req.params;
  const { page, limit } = req.query;

  const gist = await queries.getGist({client, gist_id})

  await Promise.all([
    helpers.getCurrentGistFiles({gist, page, pageSize: limit}),
    helpers.getCurrentFilesCount({gist})
  ])

  helpers.filesUrl(gist, page, limit);

  res.json({
    page,
    offset: offset(page, limit),
    files: gist.files,
    total_files: gist.total_files
  })
})

router.get('/:gist_id/files/:file_id', async (req, res) => {
  const { file_id } = req.params;

  // Consider adding revisions_url to
  // get list of revisions
  const file = await queries.getFile({client, file_id})

  res.json(file)
})

module.exports = router
