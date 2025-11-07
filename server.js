// server.js (CommonJS, использует глобальный fetch в Node >=18)
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('.')); // чтобы отдаваться index.html и css

const PORT = process.env.PORT || 3000;

app.post('/api/classify', async (req, res) => {
  const text = req.body.text;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const url = `https://api.uclassify.com/v1/${process.env.UCLASSIFY_USER}/${process.env.UCLASSIFY_CLASS}/classify`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.UCLASSIFY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ texts: [text] })
    });

    if (!response.ok) {
      const txt = await response.text();
      return res.status(502).json({ error: 'uClassify error', detail: txt });
    }

    const data = await response.json();
    // uClassify возвращает массив (для каждого переданного текста), вернём первый элемент
    return res.json(data[0]);
  } catch (err) {
    console.error('Error in /api/classify:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
