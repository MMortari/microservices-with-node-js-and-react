const express = require('express');
const cors = require('cors');
const { randomBytes } = require('crypto');
const axios = require('axios');

const app = express();

const commentsByPosts = {};

app.use(express.json());
app.use(cors());

app.get('/posts/:id/comments', (req, res) => {
  const { id } = req.params;

  const comments = commentsByPosts[id] || [];

  return res.json(comments);
});

app.post('/posts/:id/comments', async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;

  const commentId = randomBytes(4).toString('hex');

  const comments = commentsByPosts[id] || [];

  const comment = {
    id: commentId,
    content,
    status: 'pending',
  };

  comments.push(comment);

  commentsByPosts[id] = comments;

  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      ...comment,
      postId: id,
    },
  });

  return res.status(201).json(comments);
});

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  console.log('reveived event', type);

  if (type === 'CommentModerated') {
    const { postId, id, content, status } = data;

    const comments = commentsByPosts[postId];

    const comment = comments.find((com) => com.id === id);

    comment.status = status;

    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }

  return res.json({});
});

app.listen(4001, () => console.log('listen on 4001'));
