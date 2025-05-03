import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import gunzip from 'gunzip-file';

function fetchProblemData() {
  axios.get('https://hackattic.com/challenges/backup_restore/problem?access_token=a2793586d93d2bed')
    .then(function (response) {
      if (response.status === 200) {
        restoreDb(response.data.dump);
      }
    })
    .catch(function (error) {
      console.log(JSON.stringify(error));
    });
}

async function restoreDb(dump) {
  var decodedData = Buffer.from(dump, 'base64');
  
  fs.writeFileSync('./dump.gz', decodedData);
  gunzip('./dump.gz', './dump.sql');

  try {
    exec(
      `PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d test_db -f dump.sql`, 
      (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      fetchDbData();
    });
  } catch (error) {
    console.error(`Restoration error: ${error}`);
  }
}

function fetchDbData() {
  try {
    exec(
      `PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d test_db -t -c "SELECT ssn FROM criminal_records WHERE status = 'alive';"`, 
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        
        console.log(`stdout: ${JSON.stringify(stdout)}`);

        const ssnList = stdout
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
          
        console.log(`Found SSNs: ${JSON.stringify(ssnList)}`);
        console.log(`Found SSNs length: ${ssnList.length}`);
        uploadDumpData(ssnList);
      });
  } catch (error) {
    console.error(`Fetch DB data error: ${error}`);
  }
}

function uploadDumpData(dbData) {
  axios.post(
    'https://hackattic.com/challenges/backup_restore/solve?access_token=a2793586d93d2bed',
    {
      'alive_ssns': dbData,
    },
  )
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(JSON.stringify(error));
    });
}

fetchProblemData();