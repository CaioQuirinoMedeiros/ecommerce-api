'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Discount extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeSave', 'DiscountHook.calculateValues')
    this.addHook('afterSave', 'DiscountHook.decreaseCuponQuantity')
    this.addHook('afterDelete', 'DiscountHook.increaseCuponQuantity')
  }

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
