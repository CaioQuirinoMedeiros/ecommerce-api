'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const CuponTransformer = use('App/Transformers/Admin/CuponTransformer')

/**
 * DiscountTransformer class
 *
 * @class DiscountTransformer
 * @constructor
 */
class DiscountTransformer extends BumblebeeTransformer {
  static get defaultInclude() {
    return ['cupon']
  }
  /**
   * This method is used to transform the data.
   */
  transform(discount) {
    return {
      id: discount.id,
      amount: discount.discount
    }
  }

  includeCupon(discount) {
    return this.item(discount.getRelated('cupon'), CuponTransformer)
  }
}

module.exports = DiscountTransformer
