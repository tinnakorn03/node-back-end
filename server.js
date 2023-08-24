const app = require('./src/app');
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
 });
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
	console.log(`🎉🎉🎉 Application running on ENV : ${process.env.NODE_ENV} - Port: ${PORT} 🎉🎉🎉`);
});

module.exports = server;