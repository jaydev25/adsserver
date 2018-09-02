const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const spawn = require('child_process').spawn;
const app = express();
const migrations = require('./storage/migration');
const passport = require('passport');
const session = require('express-session');

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(require('./controllers'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
migrations.runMigration().then(() => {
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
});

// const migration = spawn('sh', ['migration.sh'], {stdio: 'pipe'});
// migration.stdout.on('data', data => {
//   console.log('' + data);
// });
// migration.on('close', () => {
// });
