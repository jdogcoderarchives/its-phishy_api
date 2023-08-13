// SCRIPT: Populates DB with mock data using faker.js

import { Client } from 'pg'
const client = new Client()
await client.connect()
