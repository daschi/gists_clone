const { Pool } = require('pg')
const client = new Pool({ database: 'apis' })

module.exports = client
