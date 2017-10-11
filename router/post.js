let express = require('express');
let router = express.Router();
const models = require('../models')
const decrypt = require('../helpers/hasher')
const multer  = require('multer');
const email = require('../helpers/email.js')
const upload = multer({ dest: 'public/images/' });

router.get('/', (req,res) => {
    if(req.session.hasLogin) {
        // res.send(req.session)
        res.render('post', {session:req.session})    
    } else {
        // res.send('no session')
        res.redirect('/login')
    }
})

router.post('/',upload.single('userFile'), (req,res) => {
    if(req.file === undefined) {
        models.Post.create({
            name: `${req.body.name}`,
            description: `${req.body.description}`,
            photo: `image.png`,
            Price: `${req.body.price}`,
            UserId: `${req.session.user.id}`,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .then(() => {
            res.redirect('/')
        })
    } else {
        console.log(req.file)
        models.Post.create({
            name: `${req.body.name}`,
            description: `${req.body.description}`,
            photo: `${req.file.filename}`,
            Price: `${req.body.price}`,
            UserId: `${req.session.user.id}`,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .then(() => {
            res.redirect('/')
        })
    }
})


router.get('/details/:id', (req,res) => {
    if(req.session.hasLogin) {
        models.Post.findById(req.params.id, {include: [{model:models.commentPost}]})
        .then(post => {
            models.User.findById(post.UserId)
            .then(user => {
                console.log(post)
                // console.log(user.dataValues)
                // console.log(post.commentPosts)
                var postOwner = false
                if(user.dataValues.username == req.session.user.username) {
                    postOwner = true
                }
                if(req.session.errDelete !== true && req.session.errDelete !== false) {
                    req.session.errDelete = false
                    res.render('detailPost', {row:post, owner: user.dataValues, postOwner:postOwner,errDel: req.session.errDelete, session:req.session})                    
                } else {
                    res.render('detailPost', {row:post, owner: user.dataValues, postOwner:postOwner,errDel: req.session.errDelete, session:req.session})                    
                }
            })
        })   
    } else {
        res.redirect('/login')
    }
})

router.get('/edit/:id', (req,res) => {
    if(req.session.hasLogin) {
        models.Post.findById(req.params.id, {include: [{model:models.commentPost}]})
        .then(post => {
            res.render('editPost', {row:post, session:req.session})
        //   res.send(post)
        })   
    } else {
        res.redirect('/login')
    }
})

router.post('/edit/:id', upload.single('userFile'), (req,res) => {
    models.Post.findOne({
        where: {
            id: `${req.params.id}`
        }
    })
    .then(post => {
        var oldFile = post.photo
        var oldName = post.name
        var oldDescription = post.description
        var oldPrice = post.Price
        if(req.file !== undefined) {
            oldFile = `${req.file.filename}`
        }
        if(req.body.name.length > 1) {
            oldName = `${req.body.name}`
        }
        if(req.body.description.length > 1) {
            oldDescription = `${req.body.description}`
        }
        if(req.body.price.length > 1) {
            oldPrice = `${req.body.price}`
        }
        models.Post.update({
            name: oldName,
            description: oldDescription,
            photo: oldFile,
            UserId: `${req.session.user.id}`,
            Price: oldPrice,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            where: {id: `${req.params.id}`}
        })
        .then(() => {
            res.redirect('/user')
        })
    })
   
})

router.get('/delete/:id', (req,res) => {
    models.Post.destroy({
        where: {
            id: `${req.params.id}`
        }
    })
    .then(() => {
        models.commentPost.destroy({
            where: {
                PostId: `${req.params.id}`
            }
        })
        .then(()=> {
            res.redirect('/user')            
        })
    })
    .catch(err => {
        console.log(err);
        res.send(err)
    })
})

router.post('/comment/:id', (req,res) => {
    if(req.session.hasLogin) {
        console.log(req.session)
        models.commentPost.create({
            PostId: `${req.params.id}`,
            UserId: `${req.session.user.id}`,
            comment: `${req.body.comment}`,
            Username: `${req.session.user.username}`
        })
        .then(() => {
            res.redirect(`/post/details/${req.params.id}`)
            // res.redirect(`/details/${req.params.id}`)
        })
    } else {
        res.redirect('/login')
    }
})

router.get('/comment/delete/:id/:redirect', (req,res) => {
    models.commentPost.findOne({
        where: {
            id: `${req.params.id}`
        }
    })
    .then(data => {
        if(req.session.user.id == data.UserId) {
        models.commentPost.destroy({
                where: {
                    id: `${req.params.id}`
                }
            })
            .then(() => {
                req.session.errDelete = false
                // console.log(res, 'ini res')
                console.log(req.rawHeaders, 'ini req')
                res.redirect(`/post/details/${req.params.redirect}`)
            })
            .catch(err => {
                console.log(err);
                res.send(err)
            })
        } else {
            req.session.errDelete = true
            res.redirect(`/post/details/${req.params.redirect}`)            
        }
       
    })
})

router.get('/buy/:id', (req,res) => {
    console.log(req.params, 'Ini params')
    models.Post.findOne({
        where: {
            id: `${req.params.id}`
        }
    })
    .then(data => {
        models.User.findOne({
            where: {id: `${data.UserId}`}
        })
        .then(owner => {
            console.log(owner.email, 'ini pemiliknya')
            email(owner.email,req.session.user.username,req.session.user.email, data.Price,data.name)
            console.log(data.name, 'ini nama barang')
            res.redirect(`/post/details/${req.params.id}`)
        })
    })
})
module.exports = router
