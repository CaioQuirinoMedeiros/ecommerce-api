'use strict'

class Category {
  get rules() {
    return {
      title: 'required',
      description: 'required'
    }
  }
}

module.exports = Category
