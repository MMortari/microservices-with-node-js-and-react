const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  console.log('reveived event', type);

  if (type === 'CommentCreated') {
    const { id, content, postId } = data;

    const status = content.includes('orange') ? 'rejected' : 'approved';

    await axios.post('http://localhost:4005/events', {
      type: 'CommentModerated',
      data: {
        id,
        postId,
        status,
        content,
      },
    });
  }

  return res.json({ okay: true });
});

app.listen(4003, () => console.log('listen on 4003'));
