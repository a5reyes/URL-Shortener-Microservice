require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const DNS = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urls = [];
let index = 0;
// Your first API endpoint
app.use(bodyParser.urlencoded({ extended: false }));
app.post('/api/shorturl', (req, res) => {
  const { url: _url } = req.body;
  let new_url;
  if (_url === ""){
    res.json({ error: "invalid url" });
  }
  try {
    new_url = new URL(_url);
  } catch (err) {
    res.json({ error: "invalid url" });
  }
  const modified_url = new_url.hostname;
  DNS.lookup(modified_url, (err) => {
    if (err){
      res.json({ error: "invalid url"});
    } else {
      const link = urls.find(l => l.original_url === _url);
      if (link){
        res.json({ original_url: _url, short_url: link.short_link });
      } else {
        index++;
        const url_obj = {
          original_url: new_url.href,
          short_url: index
        };
        urls.push(url_obj);
        res.json({ original_url: url_obj.original_url, short_url: url_obj.short_url });
      }
    }
  });
});

app.get('/api/shorturl/:index', (req, res) => {
  const { index: _index } = req.params;
  const short_link = urls.find(link_obj => link_obj.short_url === parseInt(_index, 10));
  if (short_link){
    res.redirect(short_link.original_url);
  } else {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
