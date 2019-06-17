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
    cupon = cupon.toJSON()
    delete cupon.created_at
    delete cupon.updated_at

    return cupon
  }

  includeUsers(cupon) {
    return this.collection(cupon.getRelated('users'), UserTransformer)
  }

  includeUsers(cupon) {
    return this.collection(cupon.getRelated('products'), ProductTransformer)
  }

  includeUsers(cupon) {
    return this.collection(cupon.getRelated('orders'), OrderTransformer)
  }
}

module.exports = CuponTransformer
