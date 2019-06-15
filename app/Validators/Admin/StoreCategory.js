'use strict'

class StoreCategory {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      title: 'required|string',
      description: 'required|string'
    }
  }

  get messages() {
    return {
      'title.required': 'O título é obrigatório!',
      'title.string': 'O título tem que ser um texto!',
      'description.required': 'A descrição é obrigatória!',
      'description.string': 'A descrição tem que ser um texto!'
    }
  }
}

module.exports = StoreCategory
