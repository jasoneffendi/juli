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
                // res.send(profile)  
                res.render('profile', {profile:profile, post:post, session:req.session})              
            })
        })
    } else {
        // res.send('no session')
        res.redirect('/login')
    }
})

router.get('/:id', (req, res)=>{ 
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
                // res.send(profile)  
                res.render('profile', {profile:profile, post:post, session:req.session})              
            })
        })
    } else {
        // res.send('no session')
        res.redirect('/login')
    }
})

module.exports = router
