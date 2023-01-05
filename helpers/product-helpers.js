var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
module.exports = {
    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodId) }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },

    getAllProductsDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
                resolve(product)
            })
        })
    },

    updateProduct: (prodId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(prodId) }, {
                $set: {
                    Name: proDetails.Name,
                    Description: proDetails.Description,
                    Price: proDetails.Price,
                    Category: proDetails.Category,
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    AdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log('login sucess');
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log('login failure');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failure');
                resolve({ status: false })
            }
        })

    },

    adminSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)
            })

        })

    },

}