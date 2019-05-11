const path = require('path')
const fs = require('fs-extra')
const { Client } = require('pg')
const rootDir = path.resolve(__dirname)

const client = new Client({
  database: 'apis',
})

const queries = {

}

const commands = {
  async resetDb() {
    const sql = (await fs.readFile(rootDir + '/schema.sql')).toString()
    console.log(sql)
    await client.query(
       sql
    )
  },
  async createUser({ email, password, username }) {
    // hash the password
    const password_hash = password
    const result = await client.query(
      `
        INSERT INTO users (email, password_hash, username)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [email, password_hash, username]
    )
    console.log(result)
    return result.rows[0]
  },

}

async function main() {
  await client.connect();
  await commands.resetDb();
  const samson = await commands.createUser({
    email: 'fake@fake.com',
    password: 'ilovesamson',
    username: 'samson'
  })
}

main().then(
  () => { process.exit(0) },
  (error) => {
    console.error(error);
    process.exit(1)
  }
)
