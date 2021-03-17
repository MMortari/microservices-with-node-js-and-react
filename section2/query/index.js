const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(cors());

const posts = {};

app.get('/posts', async (req, res) => {
  return res.json(posts);
});

function handleEvent(type, data) {
  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, status, postId } = data;

    const post = posts[postId];

    post.comments.push({
      id,
      content,
      status,
    });
  }

  if (type === 'CommentUpdated') {
    const { id, content, status, postId } = data;

    const post = posts[postId];

    const comment = post.comments.find((com) => com.id === id);

    comment.status = status;
    comment.content = content;
  }
}

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  console.log('reveived event', type);

  handleEvent(type, data);

  return res.json({ okay: true });
});

app.listen(4002, async () => {
  console.log('listen on 4002');

  const { data } = await axios.get('http://localhost:4005/events');

  data.forEach((event) => {
    console.log('Processing event -', event.type);

    handleEvent(event.type, event.data);
  });
});
