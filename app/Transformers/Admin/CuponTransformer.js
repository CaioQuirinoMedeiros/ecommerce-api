'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const UserTransformer = use('App/Transformers/Admin/UserTransformer')
const ProductTransformer = use('App/Transformers/Admin/ProductTransformer')
const OrderTransformer = use('App/Transformers/Admin/OrderTransformer')

/**
 * CuponTransformer class
 *
 * @class CuponTransformer
 * @constructor
 */
class CuponTransformer extends BumblebeeTransformer {
  static get availableInclude() {
    return ['users', 'products', 'orders']
  }
  /**
   * This method is used to transform the data.
   */
  transform(cupon) {
    return {
      id: cupon.id,
      code: cupon.code,
      discount: cupon.discount,
      quantity: cupon.quantity,
      type: cupon.type,
      can_use_for: cupon.can_use_for,
      recursive: cupon.recursive
    }
  }

  includeUsers(cupon) {
    return this.collection(cupon.getRelated('users'), UserTransformer)
  }

  includeProducts(cupon) {
    return this.collection(cupon.getRelated('products'), ProductTransformer)
  }

  includeOrders(cupon) {
    return this.collection(cupon.getRelated('orders'), OrderTransformer)
  }
}

module.exports = CuponTransformer
