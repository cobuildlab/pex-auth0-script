const axios = require('axios');
const mysql = require('mysql');
const sleep = require('sleep');

let mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB
};
const URL = process.env.AUTH0_DOMAIN;
const TOKEN = process.env.AUTH0_TOKEN;
const headers = {
  'Content-type': 'application/json',
  'authorization': `Bearer ${TOKEN}`
};
const options = {
  method: 'post',
  url: `${URL}/api/v2/users`,
  headers
};

const updatePasswords = async () => {
  const connection = mysql.createConnection(mysqlConfig);
  connection.connect();

  connection.query('SELECT * FROM pexproject_user', async (error, results) => {
      if (error) throw error;
      const emails = [];
      for (let i = 0, j = results.length; i < j; i++) {
        let row = results[i];
        emails.push(row.email);
      }

      console.log(`EMAILS:`, emails);
      const users = [];
      for (let i = 0, j = emails.length; i < j; i++) {
        const email = emails[i];
        const reqOptions = {
          ...options,
          method: 'get',
          url: `${URL}/api/v2/users-by-email?email=${email.replace('@', '%40')}`
        };
        try {
          const {data} = await axios(reqOptions);
          if (data[0]) {
            console.log(`USER_BY_EMAIL`, data[0].email);
            console.log(`USER_BY_EMAIL`, data[0].user_id);
            users.push([data[0].user_id, data[0].email]);
          }
        } catch (e) {
          console.error('ERROR BY EMAIL:n\n\n\n\n', e);
        }
        await sleep.msleep(110);
      }
      console.log(`USERS:`, users);
      for (let i = 0, j = users.length; i < j; i++) {
        const user = users[i];
        const reqOptions = {
          ...options,
          method: 'patch',
          url: `${URL}/api/v2/users/${user[0]}`,
          data: {
            password: `k0UXpGR09EQXdRelkyTmpZeE16aEdSR!1@2#3...`
          }
        };

        try {
          console.log(`USER UPDATED:`, user);
        } catch (e) {
          const {message} = e.response.data;
          console.error('ERROR:', message);
        }
        await sleep.msleep(110);
      }
    }
  );
  connection.end();
};

/**
 *
 * @returns {Promise<void>}
 */
const createUsers = async () => {
  const connection = mysql.createConnection(mysqlConfig);
  connection.connect();

  connection.query('SELECT * FROM pexproject_user', async (error, results, fields) => {
      if (error) throw error;
      const errorUsers = [];
      const updatedEmails = [];
      for (let i = 0, j = results.length; i < j; i++) {
        let row = results[i];
        const data = {
          connection: `Username-Password-Authentication`,
          "email": row.email,
          password: `EQXdRelkyTmpZeE16aEdSRGRHUX.1!2@3#`,
          "blocked": false,
          "email_verified": false,
          "user_metadata": {
            username: row.username,
            gender: row.gender,
            dateOfBirth: row.date_of_birth,
            language: row.language,
            country: row.country,
            phone: row.phone,
            homeAirport: row.home_airport,
            address1: row.address1,
            address2: row.address2,
            city: row.city,
            state: row.state,
            zipcode: row.zipcode,
            usercode: row.usercode,
            userCodeTime: row.user_code_time,
            isStaff: row.is_staff,
            pexdeals: row.pexdeals,
            level: row.level,
            isSuperuser: row.is_superuser,
            dateJoined: row.date_joined,
            searchLimit: row.search_limit,
            searchRun: row.search_run,
            walletId: row.wallet_id,
            acctAlaska: row.acct_alaska,
            promCodeId: row.prom_code_id
          },
          "app_metadata": {},
          "picture": "https://secure.gravatar.com/avatar/15626c5e0c749cb912f9d1ad48dba440?s=480&r=pg&d=https%3A%2F%2Fssl.gstatic.com%2Fs2%2Fprofiles%2Fimages%2Fsilhouette80.png",
          "verify_email": false,
        };
        if (row.first_name) {
          data.given_name = row.first_name;
          if (row.last_name)
            data.name = `${row.first_name} ${row.last_name}`;
          else
            data.name = row.first_name;
        }
        if (row.last_name)
          data.family_name = row.last_name;

        const reqOptions = {
          ...options,
          data
        };
        try {
          const res = await axios(reqOptions);
          console.log("GOOD:", res.status);
        } catch (e) {
          const {message} = e.response.data;
          console.error('ERROR:', message);
          if (message !== 'The user already exists.') {
            console.log("DATA:", data);
            errorUsers.push(data);
          } else {
            updatedEmails.push(data.email);
          }
        }
        await sleep.sleep(1);
        // if (i === 10) {
        //   break
        // }
      }
      console.log("ERRORS:", errorUsers);
    }
  );
  connection.end();
};

updatePasswords().then(() => {
}).catch(console.error);
