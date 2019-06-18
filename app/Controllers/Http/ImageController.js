'use strict'

const Helpers = use('Helpers')

class ImageController {
  async download({ params, response }) {
    console.log('Olá')
    return response.download(Helpers.publicPath(`uploads/${params.path}`))
  }
}

module.exports = ImageController
