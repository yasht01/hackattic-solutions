import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3000;

let jwtSecret = '';
let payload = '';

async function fetchProblemData() {
  try {
    const response = await axios.get('https://hackattic.com/challenges/jotting_jwts/problem?access_token=');
    if (response.status === 200) {
      jwtSecret = response.data.jwt_secret;
    }
  } catch (error) {
    console.log(JSON.stringify(error));
    throw error;
  }
}

function uploadAppUrl(appUrl) {
  axios.post(
    'https://hackattic.com/challenges/jotting_jwts/solve?access_token=',
    {
      'app_url': appUrl,
    },
  )
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(JSON.stringify(error));
    });
}

app.use(function (req, res, next) {
  let rawBody = "";
  req.setEncoding("utf8");

  req.on("data", function (chunk) {
    rawBody += chunk;
  });

  req.on("end", function () {
    req.rawBody = rawBody;
    next();
  });
});

app.post('/',
  (req, res) => {
    let token;
    token = req.rawBody;
    
    try {
      const decoded = jwt.verify(token, jwtSecret);

      if (decoded.append) {
        payload += decoded.append;
        res.json({ message: 'JWT verified successfully' });
      } else {
        res.json({ solution: payload });
      }
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      res.status(401).json({ error: 'JWT verification failed', message: error.message });
    }
  }
);

async function startServer() {
  try {
    await fetchProblemData();
    
    app.listen(port, async () => {
      console.log(`Server listening on ${port}`);
      uploadAppUrl('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();