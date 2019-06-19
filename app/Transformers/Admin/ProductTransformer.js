'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')
const CategoryTransformer = use('App/Transformers/Admin/CategoryTransformer')

/**
 * ProductTransformer class
 *
 * @class ProductTransformer
 * @constructor
 */
class ProductTransformer extends BumblebeeTransformer {
  static get defaultInclude() {
    return ['image', 'categories']
  }
  /**
   * This method is used to transform the data.
   */
  transform(product) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price).toFixed(2)
    }
  }

  includeImage(product) {
    return this.item(product.getRelated('image'), ImageTransformer)
  }

  includeCategories(product) {
    return this.collection(
      product.getRelated('categories'),
      CategoryTransformer
    )
  }
}

module.exports = ProductTransformer
