const express = require('express')
const app = express()
const PORT = process.env.PORT || 4001;

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html");
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));