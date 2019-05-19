const express = require('express');
const router = require('express-promise-router')();
const queries = require('../queries')
const client = require('../db')
const { offset } = queries

// TODO:
// Add Etag header
// Add authentication
//

// All gists
router.get('/', async (req, res) => {
  const { page = 1, limit = 5 } = req.query

  const gists = await queries.getGists({client, page, pageSize: limit})

  await Promise.all([
    _getUsersForGists(gists),
    _getPreviewForGists(gists)
  ])

  res.json({page, limit, offset: offset(page, limit), gists})
})

router.get('/:gist_id', async (req, res) => {
  const { gist_id } = req.params

  const gist = await queries.getGist({client, gist_id})
  await Promise.all([
    _getUsersForGists([gist]),
    _getCurrentGistFiles({gist, page: 1, pageSize: 5}),
    _getCurrentFilesCount({gist})
  ])
  gist.files_url = _format_files_url(gist);
  res.json(gist)
})

async function _getUsersForGists(gists) {
  const user_ids = gists.map(gist => gist.user_id)
  const users = await queries.getUsers({client, user_ids})

  users.forEach((user) => {
    gists.forEach((gist) => {
      if(gist.user_id === user.user_id) gist.user = user;
    })
  })
}

async function _getPreviewForGists(gists) {
  const revision_ids = gists.map(gist => gist.latest_revision_id);
  const files = await queries.getPreviewForGists({client, revision_ids});
  files.forEach((file) => {
    const gist = gists.find((gist) => gist.latest_revision_id === file.revision_id);
    gist.file = file;
  });
}

async function _getCurrentGistFiles({gist, page, pageSize}) {
  const revision_id = gist.latest_revision_id;
  const files = await queries.getCurrentGistFiles({client, revision_id, page, pageSize});
  gist.files = files;
}

async function _getCurrentFilesCount({gist}) {
  const revision_id = gist.latest_revision_id;
  const totalFiles = await queries.getCurrentFilesCount({client, revision_id});
  gist.total_files = parseInt(totalFiles.count)
}

function _format_files_url(gist) {
  return `http://localhost:3000/v1/gists/${gist.gist_id}/files?page=1&limit=5`
}

module.exports = router
