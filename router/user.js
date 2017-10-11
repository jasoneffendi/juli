let express = require('express');
let router = express.Router();
const models = require('../models')
const decrypt = require('../helpers/hasher')
// const multer  = require('multer');
// const upload = multer({ dest: 'uploads/' });

router.get('/', (req, res)=>{ 
    if(req.session.hasLogin) {
        // res.send(req.session)
        models.User.findAll({
            where: {
                id: `${req.session.user.id}`
            }
        })
        .then(profile => {
            models.Post.findAll({
                where: {
                    UserId: `${profile[0].id}`
                }
            })
            .then(post => {
                console.log(post)
                res.render('profile', {profile:profile, post:post, session:req.session})              
            })
        })
    } else {
        // res.send('no session')
        res.redirect('/login')
    }
})

// router.get('/:id', (req, res)=>{ 
//     if(req.session.hasLogin) {
//         // res.send(req.session)
//         models.User.findAll({
//             where: {
//                 id: `${req.session.user.id}`
//             }
//         })
//         .then(profile => {
//             models.Post.findAll({
//                 where: {
//                     UserId: `${profile[0].id}`
//                 }
//             })
//             .then(post => {
//                 console.log(post)
//                 // res.send(profile)  
//                 res.render('profile', {profile:profile, post:post, session:req.session})              
//             })
//         })
//     } else {
//         // res.send('no session')
//         res.redirect('/login')
//     }
// })

router.get('/messages', (req,res) => {
    if(req.session.hasLogin) {
        models.Contact.findAll({
            where: {
                UserId: `${req.session.user.id}`
            }
        })
        .then(outbox => {
            models.Contact.findAll({
                where: {
                    ReceiveId: `${req.session.user.id}`
                }
            })
            .then(inbox => {
                models.User.findAll()
                .then(user => {
                    console.log(user)
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
        models.User.findOne({
            where: {
                id: `${req.body.ReceiveId}`
            }
        })
        .then(data => {
            models.Contact.findAll({
                where: {
                    UserId: `${req.session.user.id}`,
                    ReceiveId: `${data.id}`
                }
            })
            .then(duplicate1 => {
                models.Contact.findAll({
                    where: {
                        ReceiveId: `${req.session.user.id}`,
                        UserId: `${data.id}`
                    }
                })
                .then(duplicate2 => {
                    if(duplicate1.length && duplicate2.length === 0) {
                        console.log('ADA DUPLIKAT++++++++++++++++')
                        req.session.errDuplicate = true
                        res.redirect('/user/messages')
                    } else {
                        models.Contact.create({
                            ReceiveName: `${data.username}`,
                            UserId: `${req.session.user.id}`,
                            ReceiveId: `${data.id}`,
                            photo: `${data.photo}`
                        })
                        .then(() => {
                            req.session.errDuplicate = false
                            res.redirect('/user/messages')
                        })
                    }
                })
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
