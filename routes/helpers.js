const queries = require('../queries')
const client = require('../db')

const helpers = {
  async getPreviewForGists(gists) {
    const revision_ids = gists.map(gist => gist.latest_revision_id);
    const files = await queries.getPreviewForGists({client, revision_ids});
    files.forEach((file) => {
      const gist = gists.find((gist) => gist.latest_revision_id === file.revision_id);
      gist.file = file;
    });
  },

  async getUsersForGists(gists) {
    const user_ids = gists.map(gist => gist.user_id)
    const users = await queries.getUsers({client, user_ids})

    users.forEach((user) => {
      gists.forEach((gist) => {
        if(gist.user_id === user.user_id) gist.user = user;
      })
    })
  },

  async getCurrentGistFiles({gist, page, pageSize}) {
    const revision_id = gist.latest_revision_id;
    const files = await queries.getCurrentGistFiles({client, revision_id, page, pageSize});
    gist.files = files;
  },

  async getCurrentFilesCount({gist}) {
    const revision_id = gist.latest_revision_id;
    const totalFiles = await queries.getCurrentFilesCount({client, revision_id});
    gist.total_files = parseInt(totalFiles.count)
  },

  getFileURL(gist, page = 1, limit = 5) {
    gist.files_url = this.filesUrl(gist.gist_id, page, limit)
  },

  filesUrl(gist_id, page = 1, limit = 5) {
    return `http://localhost:3000/v1/gists/${gist_id}/files?page=${page + 1}&limit=${limit}`
  }
}

module.exports = helpers
