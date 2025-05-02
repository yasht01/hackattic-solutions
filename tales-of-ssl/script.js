import axios from 'axios';
import { exec } from 'child_process';
import * as fs from 'fs';

function fetchProblemData() {
  axios.get('https://hackattic.com/challenges/tales_of_ssl/problem?access_token=')
    .then(function (response) {
      if (response.status === 200) {
        savePrivateKey(response.data['private_key']);
        generateSSLCert(response.data);
      }
    })
    .catch(function (error) {
      console.log(JSON.stringify(error));
    });
}

function savePrivateKey(privateKey) {
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  }
  console.log('Private key saved to key.pem');
  fs.writeFileSync('key.pem', privateKey);
}

function generateSSLCert(payload) {
  console.log(payload);

  let countryCode = '';

  if (payload.required_data.country === 'Keeling Islands') {
    countryCode = 'CC';
  } else if (payload.required_data.country === 'Cocos Islands') {
    countryCode = 'CC';
  } else if (payload.required_data.country === 'Sint Maarten') {
    countryCode = 'SX';
  } else if (payload.required_data.country === 'Christmas Island') {
    countryCode = 'CX';
  } else {
    countryCode = 'TK';
  }

  try {
    console.log(`country code: ${countryCode}`);

    exec(
      `openssl req -key key.pem -new -x509 -days 365 -out certificate.crt \
       -subj "/C=${countryCode}/ST=State/L=City/O=YourOrg/CN=${payload.required_data.domain}" \
       -set_serial ${payload.required_data.serial_number}`, 
      (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
    });

    exec(
      `openssl x509 -in certificate.crt -outform der | base64`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        
        const certificate = stdout.trim();
        uploadSSLCert(certificate);
      }
    )
  } catch (error) {
    console.log(error);
  }
}

function uploadSSLCert(certificate) {
  axios.post('https://hackattic.com/challenges/tales_of_ssl/solve?access_token=',
    {
      'certificate': certificate
    }
  )
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(JSON.stringify(error));
    });
}


fetchProblemData();