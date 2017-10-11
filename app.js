const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use(session({
  secret: 'lively-2017',
  cookie: {}
}))
app.use( express.static( "public" ) );
// app.use(express.static('public'))
let index = require('./router/index.js')
let user = require('./router/user.js')
let post = require('./router/post.js')
// let teachers = require('./routes/teachers.js')
// let subjects = require('./routes/subjects.js')
// let students = require('./routes/students.js')

app.use('/',index)
app.use('/user', user)
app.use('/post', post)
// app.use('/teachers', teachers);
// app.use('/subjects', subjects)
// app.use('/students', students)

app.listen(process.env.PORT || 3000, () => {
  console.log('app start on port 3000');
})
