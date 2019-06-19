'use strict'

class StoreOrder {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      'items.*.product_id': 'exists:products,id',
      'items.*.quantity': 'min:1'
    }
  }

  get messages() {
    return {
      'items.*.product_id.exists': 'O produto não existe!',
      'items.*.quantity.min': 'A quantidade mínima é 1!'
    }
  }
}

module.exports = StoreOrder
