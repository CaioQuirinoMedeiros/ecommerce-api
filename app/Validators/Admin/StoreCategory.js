'use strict'

class StoreCategory {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      title: 'required',
      description: 'required'
    }
  }

  get messages() {
    return {
      'title.required': 'O título é obrigatório',
      'description.required': 'A descrição é obrigatória'
    }
  }
}

module.exports = StoreCategory
