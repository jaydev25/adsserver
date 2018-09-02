const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const app = express();
const migrations = require('./storage/migration');

const morgan = require('morgan');
const passport = require('passport');
const config = require('./controllers/config/main');
const cors = require('cors');

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(morgan('dev'));
app.use(require('./controllers'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
require('./controllers/signup')(app);
migrations.runMigration().then(() => {
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
});

