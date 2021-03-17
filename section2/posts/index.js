const express = require('express');
const cors = require('cors');
const { randomBytes } = require('crypto');
const axios = require('axios');

const app = express();

const posts = {};

app.use(express.json());
app.use(cors());

app.get('/posts', (req, res) => {
  return res.json(posts);
});

app.post('/posts', async (req, res) => {
  const { title } = req.body;

  const id = randomBytes(4).toString('hex');

  const post = {
    id,
    title,
  };

  posts[id] = post;

  await axios.post('http://localhost:4005/events', {
    type: 'PostCreated',
    data: post,
  });

  return res.status(201).json(post);
});

app.post('/events', async (req, res) => {
  console.log('reveived event', req.body.type);

  return res.json({});
});

app.listen(4000, () => console.log('listen on 4000'));
