import axios from 'axios';
import { sha256 } from 'js-sha256';

function fetchProblemData() {
  axios.get('https://hackattic.com/challenges/mini_miner/problem?access_token=')
    .then(function (response) {
      if (response.status === 200) {
        calculateNonce(response.data);
      }
    })
    .catch(function (error) {
      console.log(JSON.stringify(error));
    });
}

function calculateNonce(problemData) {
  console.log(`Problem data: ${JSON.stringify(problemData)}`);
  const zeroBits = problemData.difficulty;

  let nonce = 0;
  let shaPayload = {
    "data": problemData.block.data,
    "nonce": nonce,
  };
  let sha256Digest = calculateSHA256Digest(shaPayload);

  while(!isConditionSatisfied(zeroBits, convertSHA256DigestToBinaryFormat(sha256Digest))) {
    shaPayload.nonce = nonce;
    sha256Digest = calculateSHA256Digest(shaPayload);
    console.log(`SHA 256 Digest: ${sha256Digest}`);
    nonce++;
  }

  uploadNonce(nonce - 1);
}

function isConditionSatisfied(zeroBits, payload) {
  let substring = '';
  for (let i = 0; i < zeroBits; i++) {
    substring += '0';
  }
  
  console.log(`Zero Bits: ${zeroBits}`);
  console.log(substring);
  console.log(payload.substring(0, zeroBits));

  return payload.startsWith(substring);
}

function calculateSHA256Digest(payload) {
  try {
    console.log(`SHA256 Payload: ${JSON.stringify(payload)}`);
    return sha256(JSON.stringify(payload));
  } catch (error) {
    console.log(`SHA256 Parsing Error: ${error}`);
  }
}

function convertSHA256DigestToBinaryFormat(digest) {
  let input = digest;
  let output = '';

  for (var i = 0; i < input.length; i++) {
    output += (parseInt(input[i], 16).toString(2)).padStart(4, '0');
  }

  return output;
}

function uploadNonce(nonce) {
  axios.post(
    'https://hackattic.com/challenges/mini_miner/solve?access_token=',
    {
      'nonce': nonce,
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