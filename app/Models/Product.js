'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {
  image() {
    return this.belongsTo('App/Models/Image')
  }

  images() {
    return this.belongsToMany('App/Models/Image')
  }

  categories() {
    return this.belongsToMany('App/Models/Category')
  }

  cupons() {
    return this.belongsToMany('App/Models/Cupon')
  }
}

module.exports = Product
