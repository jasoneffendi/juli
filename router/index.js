let express = require('express');
let router = express.Router();
const models = require('../models')
const decrypt = require('../helpers/hasher')
const multer  = require('multer');
const upload = multer({ dest: 'public/images/' });

router.get('/', (req, res)=>{ 
    if(req.session.hasLogin) {
        models.Post.findAll({
            include: [{model:models.User}]
        })
        .then(data => {
            console.log(data[0])
            res.render('index', {data:data, session:req.session})
            // res.send(data)
        })
        // res.send(req.session)
        // res.render('index', {title: 'Index', session: req.session})
    } else {
        // res.send('no session')
        res.redirect('/login')
    }
})

router.get('/login', (req, res)=>{
    res.render('login', {title: 'login',err:req.session.err})
})

router.post('/login', (req, res)=>{
    if(req.body.username && req.body.password !== '') {
        req.session.err = false
        models.User.findAll({
            where: {
                username: `${req.body.username}`
            }
        })
        .then(user => {
            // console.log(user[0], 'user')
          let hash = decrypt(req.body.password, user[0].salt)
        //   console.log(hash, 'hash')
          if(req.body.username === user[0].username && hash === user[0].password) {
              req.session.hasLogin = true;
              req.session.user = {
                  username: user[0].username,
                  id: user[0].id,
                  email:user[0].email,
                  loginTime: new Date()
              }
            //   res.send('berhasil')
              res.redirect('/')
          }
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login')
        })
    } else {
        req.session.err = true
        res.redirect('/login')
    }
 
})


router.get('/register', (req, res)=>{
    res.render('register', {title: 'register', err:req.session.regerr})
})

router.post('/registeruser', (req, res)=>{
    console.log(req.file)
    if(req.body.register_username&& req.body.register_email && req.body.register_password !== '') {
        req.session.regerr = false
        models.User.create({
            username: `${req.body.register_username}`,
            password: `${req.body.register_password}`,
            email: `${req.body.register_email}`,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .then(student => {
            // res.send('register success')
            res.render('registerSuccess')
          })
          .catch(err => {
            console.log(err);
          })
    } else {
        req.session.regerr = true
        res.redirect('/register')
    }
   
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
  })
  

module.exports = router
