'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Discount extends Model {
  static get table() {
    return 'cupon_order'
  }

  order() {
    return this.belongsTo('App/Models/Order', 'order_id', 'id')
  }

  cupon() {
    return this.belongsTo('App/Models/Cupon', 'cupon_id', 'id')
  }
}

module.exports = Discount
