const {offset} = require('./helpers')

const queries = {
  async getRevisionsByParentId({client, parent_id}){
    console.log('getRevisionsByParentId', parent_id)
    const result = await client.query(
      `
        WITH RECURSIVE previous_revisions AS (
          SELECT
            r1.revision_id,
            r1.previous_id,
            r1.gist_id,
            r1.created_at
          FROM revisions r1
          WHERE r1.revision_id = $1

          UNION

          SELECT
            r.revision_id,
            r.previous_id,
            r.gist_id,
            r.created_at
          FROM revisions r

          JOIN previous_revisions pr
          ON pr.previous_id = r.revision_id
        )
        SELECT *
        FROM previous_revisions pr
      `,
      [parent_id]
    )
    return result.rows
  },
}
module.exports = queries
