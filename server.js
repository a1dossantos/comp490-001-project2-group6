const express = require('express');
const app = express();

app.use('/keeweb', express.static('dist'));

app.listen(8080, () => {
    console.log('http://localhost:8080/keeweb/');
});
