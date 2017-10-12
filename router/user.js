let express = require('express');
let router = express.Router();
const models = require('../models')
const decrypt = require('../helpers/hasher')
// const multer  = require('multer');
// const upload = multer({ dest: 'uploads/' });

router.get('/', (req, res)=>{ 
    if(req.session.hasLogin) {
        models.User.findById(req.session.user.id)
        .then(profile => {
            models.Post.findAll({
                where: {
                    UserId: `${profile.id}`
                }
            })
            .then(post => {
                // res.send(profile)
                // console.log(post)
                res.render('profile', {profile:profile, post:post, session:req.session, owner: true})              
            })
        })
    } else {
        // res.send('no session')
        res.redirect('/login')
    }
})

router.post('/', (req,res) => {
    if(req.body.update_username&& req.body.update_email && req.body.update_password !== '') {
        req.session.regerr = false
        models.User.update({
            username: `${req.body.update_username}`,
            password: `${req.body.update_password}`,
            email: `${req.body.update_email}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }, {
              where: {id: `${req.session.user.id}`}
          })
          .then(() => {
            res.redirect('/user')
          })
          .catch(err => {
            console.log(err);
          })
    } else {
        res.redirect('/user')
    }
})

router.get('/:id', (req, res)=>{ 
    if(req.session.hasLogin) {
        models.User.findAll({
            where: {
                id: `${req.params.id}`
            }
        })
        .then(profile => {
            models.Post.findAll({
                where: {
                    UserId: `${profile[0].id}`
                }
            })
            .then(post => {
                // console.log(post)
                // res.send(profile)  
                if(req.session.user.id === profile[0].id) {
                    res.redirect('/user')
                } else {
                    res.render('profile', {profile:profile[0], post:post, session:req.session, owner: false})              
                }
            })
        })
    } else {
        // res.send('no session')
        res.redirect('/login')
    }
})

router.get('/messages', (req,res) => {
    if(req.session.hasLogin) {
        models.Contact.findAll({
            where: {
                UserId: `${req.session.user.id}`
            }
        })
        .then(outbox => {
            models.Contact.findAll(
            {
                where: {
                    ReceiveName: `${req.session.user.username}`,
                    ReceiveId: `${req.session.user.id}`
                },
                
                    include: [{model:models.User}]
                
            })
            .then(inbox => {
                models.User.findAll()
                .then(user => {
                    // console.log(user)
                    // res.send(inbox)
                    res.render('messages', {inbox:inbox, outbox: outbox, session:req.session, user:user, err: req.session.errDuplicate})                    
                })
            })
        })
    } else {
        res.redirect('/')
    }
})

router.post('/messages', (req,res) => {
    if(req.session.hasLogin) {
            models.Contact.findAll({
                where: {
                    UserId: `${req.session.user.id}`,
                    ReceiveId: `${req.body.ReceiveId}`
                }
            })
            .then(duplicate1 => {
                models.Contact.findAll({
                    where: {
                        ReceiveId: `${req.session.user.id}`,
                        UserId: `${req.body.ReceiveId}`
                    }
                })
                .then(duplicate2 => {
                    models.User.findAll({
                        where: {
                            id : `${req.body.ReceiveId}`
                        }
                    })
                    .then(receive => {
                        // console.log(receive, '==========================')
                        if(duplicate1.length && duplicate2.length === 0) {
                            // console.log('ADA DUPLIKAT++++++++++++++++')
                            req.session.errDuplicate = true
                            res.redirect('/user/messages')
                        } else {
                            models.Contact.findAll({
                                where: {
                                    ReceiveId: `${req.session.user.id}`,
                                    UserId : `${req.body.ReceiveId}`
                                }
                            })
                            .then( data => {
                                models.Contact.findAll({
                                    where: {
                                        UserId: `${req.session.user.id}`,
                                        ReceiveId : `${req.body.ReceiveId}`
                                    }
                                })
                                .then(data2=> {
                                    if(data.length < 1 && data2.length < 1) {
                                        models.User.findAll({
                                            where: {
                                                id : `${req.body.ReceiveId}`
                                            }
                                        })
                                        .then(receive => {
                                            // res.send(receive)
                                            req.session.errDuplicate = false
                                            models.Contact.create({
                                                ReceiveName: `${receive[0].username}`,
                                                UserId: `${req.session.user.id}`,
                                                ReceiveId: `${receive[0].id}`,
                                                photo: `${receive[0].photo}`
                                            })
                                            .then(() => {
                                                req.session.errDuplicate = false
                                                res.redirect('/user/messages')
                                            })
                                        })
                                        // res.send('no dupli')
                                    } else {
                                        req.session.errDuplicate = true
                                        res.redirect('/user/messages')
                                    }
                                    
                                    // res.send(data)                                    
                                })
                            })
                        }
                    })
                    // console.log(duplicate1, '+++++++++++++++')
                    // console.log(duplicate2,'==================')
            
                })
            })
    } else {
        res.redirect('/login')
    }
})

router.get('/messages/:id/outbox', (req,res) => {
    if(req.session.hasLogin) {
        models.Contact.findById(req.params.id, {include: [{model:models.Message}]})
        .then(data => {
            // res.send(data)
            res.render('viewMessages', {row:data, session:req.session, position:'outbox'})
        })
    } else {
        res.redirect('/login')
    }
})

router.get('/messages/:id/outbox/delete', (req,res) => {
    if(req.session.hasLogin) {
        models.Contact.destroy({
            where: {
                id: `${req.params.id}`
            }
        })
        .then(data => {
            // res.send(data)
            res.redirect('/user/messages')
        })
    } else {
        res.redirect('/login')
    }
})

router.get('/messages/:id/inbox', (req,res) => {
    if(req.session.hasLogin) {
        models.Contact.findById(req.params.id, {include: [{model:models.Message}]})
        .then(data => {
            res.render('viewMessages', {row:data, session:req.session, position:'inbox'})
        })
    } else {
        res.redirect('/login')
    }
})

router.post('/messages/:id/send/:position',(req,res) => {
    if(req.session.hasLogin) {
        models.Message.create({
            message: `${req.body.message}`,
            UserId: `${req.session.user.id}`,
            ReceiveId: 0,
            Username: `${req.session.user.username}`,
            ContactId: `${req.params.id}`,
            photo: `${req.session.user.photo}`
        })
        .then(() => {
            res.redirect(`/user/messages/${req.params.id}/${req.params.position}`)
        })
    }
})

module.exports = router
