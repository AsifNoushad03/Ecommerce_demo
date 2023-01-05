var express = require('express');
const session = require('express-session');
const { Session } = require('express-session');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET users listing. */
router.get('/',function (req, res, next) {
  let adminUser = req.session.admin
  if (adminUser) {
    productHelpers.getAllProducts().then((products) => {
      console.log(products);
      res.render('admin/view-products', { admin: true, products, adminUser });
    })
  }
  else {
    res.redirect('/admin/login')
  }
});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product')
})

router.post('/add-product', (req, res) => {
  console.log(req.body);
  console.log(req.files.Image);

  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.render('admin/add-product')
      } else {
        console.log(err);
      }
    })
  })
})

router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getAllProductsDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product })
})

router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then((response) => {
    res.redirect('/admin')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})

router.post('/login', (req, res) => {
  productHelpers.AdminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin
      req.session.admin.loggedIn = true;
      res.redirect('/admin')
    } else {
      req.session.adminLoginErr = "Invalid Username and Password";
      res.redirect('/admin/login')
    }
  })
})

router.get('/login', (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { "loginErr": req.session.adminLoginErr })
    req.session.adminLoginErr = false
  }
})

router.get('/logout', (req, res) => {
  req.session.admin = req.session.destroy();
  res.redirect('/admin/login')
})



router.get('/signup', (req, res) => {
  res.render('admin/signup')
})

router.post('/signup', (req, res) => {
  productHelpers.adminSignup(req.body).then((response) => {
    console.log(response);

    res.redirect('/admin/login')
  })
})

module.exports = router;
