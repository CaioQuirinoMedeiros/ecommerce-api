'use strict'

class StoreProduct {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      name: 'required|string',
      description: 'required|string',
      price: 'required|range:-0.0000001,1000000'
    }
  }

  get messages() {
    return {
      'name.required': 'O título é obrigatório!',
      'name.string': 'O título tem que ser um texto!',
      'description.required': 'A descrição é obrigatória!',
      'description.string': 'A descrição tem que ser um texto!',
      'price.required': 'O preço é obrigatório!',
      'price.range': 'O preço deve ser entre 0 e 1000000!'
    }
  }
}

module.exports = StoreProduct
