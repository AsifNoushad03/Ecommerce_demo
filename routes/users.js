const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user, cartCount });
  })

});

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.userloginErr })
    req.session.userloginErr = false
  }
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.user = response.user
    req.session.user.loggedIn = true;
    res.redirect('/login')
  })
})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.user.loggedIn = true;
      res.redirect('/')
    } else {
      req.session.userloginErr = "Invalid Username and Password";
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  
  let product = await userHelpers.getCartProducts(req.session.user._id)
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  let user = req.session.user._id
  console.log(product);
  console.log(user);
  console.log(total);
  res.render('user/cart', { product, user, total })
})

router.get('/add-to-cart/:id', (req, res) => {
  console.log("api call to add to cart");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', (req, res) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.post('/remove-cart-product', (req, res) => {
  userHelpers.removeCartProduct(req.body).then((response) => {
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
})

router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductsList(req.body.userId)
  totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((response) => {
    res.json({ status: true })
  })
  console.log(req.body);
})

router.get('/order-sucess', (req, res) => {
  res.render('user/order-sucess', { user: req.session.user })
})

router.get('/orders', verifyLogin, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/order', { user: req.session.user, orders })
})

router.get('/view-order-products/:id', async (req, res) => {
  let product = await userHelpers.getOrderProducts(req.params.id)
  console.log(product);
  res.render('user/order-products', { user: req.session.user, product })
})

module.exports = router;
