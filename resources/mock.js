// SCRIPT: Populates DB with mock data using faker.js

const { Pool } = require('pg')
const { faker } = require('@faker-js/faker');

require("dotenv").config();

const pool = new Pool({
    database: process.env.POSTGRES_DB || "itsphishy-api",
    user: process.env.POSTGRES_USER || "default_host",
    host: process.env.DATABASE_URL || "localhost",
    password: process.env.POSTGRES_PASSWORD || "supersecurepassword",
    port: Number(process.env.POSTGRES_PORT || 5432)
})

function createRandomUser() {

    let first_name = faker.person.firstName();
    let last_name = faker.person.lastName();
    let username = faker.internet.userName({ first_name, last_name });
    let email = faker.internet.email({ first_name, last_name })
    let phone = faker.phone.number('###-###-###');
    let password = faker.internet.password();


    return {
        username: username,
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone_number: phone,
        password: password
    };
}

function createRandomDomain() {

    let domain = faker.internet.domainName();
    // classification is a number between 1 and 6
    let classification = Math.floor(Math.random() * 6) + 1;
    let reportedby = Math.floor(Math.random() * 25) + 1;

    return {
        domain: domain,
        classification: classification,
        reported_by: reportedby
    };
}

function createRandomLink() {

    let link = faker.internet.url();
    // classification is a number between 1 and 6
    let classification = Math.floor(Math.random() * 6) + 1;
    let reportedby = Math.floor(Math.random() * 25) + 1;

    return {
        link: link,
        classification: classification,
        reported_by: reportedby
    };
}


function createRandomEmail() {

    let email = faker.internet.email();
    // classification is a number between 1 and 6
    let classification = Math.floor(Math.random() * 6) + 1;
    let reportedby = Math.floor(Math.random() * 25) + 1;

    return {
        email: email,
        classification: classification,
        reported_by: reportedby
    };
}

function createRandomPhoneNumber() {

    let phone_number = faker.phone.number('###-###-####');
    let classification = Math.floor(Math.random() * 6) + 1;
    let reportedby = Math.floor(Math.random() * 25) + 1;


    return {
        phone_number: phone_number,
        classification: classification,
        reported_by: reportedby
    };
}




// create main async function
async function main() {

    // connect to database
    const client = await pool.connect();

    // create 10 dummy users
    for (let i = 0; i < 25; i++) {
        const user = createRandomUser();
        const query = {
            text: `INSERT INTO users(username, first_name, last_name, email, phone_number, password) VALUES($1, $2, $3, $4, $5, $6)`,
            values: [user.username, user.first_name, user.last_name, user.email, user.phone_number, user.password]
        }
        await client.query(query);
    }

    // populate 25 sample domains to db (also update the classification domain_count in that table based on the classification of the domain)
    for (let i = 0; i < 25; i++) {
        const domain = createRandomDomain();
        const query = {
            text: `INSERT INTO domains(domain, classification, reported_by) VALUES($1, $2, $3)`,
            values: [domain.domain, domain.classification, domain.reported_by]
        }
        await client.query(query);

        // update classification domain_count
        const updateQuery = {
            text: `UPDATE classifications SET domain_count = domain_count + 1 WHERE id = $1`,
            values: [domain.classification]
        }
        await client.query(updateQuery);

    }

    // populate 25 sample emails to db (also update the classification email_count in that table based on the classification of the email)
    for (let i = 0; i < 25; i++) {
        const email = createRandomEmail();
        const query = {
            text: `INSERT INTO emails(email, classification, reported_by) VALUES($1, $2, $3)`,
            values: [email.email, email.classification, email.reported_by]
        }
        await client.query(query);

        // update classification email_count
        const updateQuery = {
            text: `UPDATE classifications SET email_count = email_count + 1 WHERE id = $1`,
            values: [email.classification]
        }

        await client.query(updateQuery);

    }

    // populate 25 sample links to db (also update the classification link_count in that table based on the classification of the link)
    for (let i = 0; i < 25; i++) {
        const link = createRandomLink();
        const query = {
            text: `INSERT INTO links(link, classification, reported_by) VALUES($1, $2, $3)`,
            values: [link.link, link.classification, link.reported_by]
        }
        await client.query(query);

        // update classification link_count
        const updateQuery = {
            text: `UPDATE classifications SET link_count = link_count + 1 WHERE id = $1`,
            values: [link.classification]
        }

        await client.query(updateQuery);

    }


    // populate 25 sample phone numbers to db (also update the classification phone_count in that table based on the classification of the phone number)
    for (let i = 0; i < 25; i++) {
        const phone = createRandomPhoneNumber();
        const query = {
            text: `INSERT INTO phone_numbers(phone_number, classification, reported_by) VALUES($1, $2, $3)`,
            values: [phone.phone_number, phone.classification, phone.reported_by]
        }
        await client.query(query);

        // update classification phone_count
        const updateQuery = {
            text: `UPDATE classifications SET phone_count = phone_count + 1 WHERE id = $1`,
            values: [phone.classification]
        }

        await client.query(updateQuery);

    }



    // close connection
    client.release();

    // exit process
    process.exit();

}

main();