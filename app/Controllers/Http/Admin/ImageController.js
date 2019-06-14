'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Image = use('App/Models/Image')
const {manage_single_upload, manage_multiple_upload} = use("App/Helpers")
const fs = use('fs')

class ImageController {
  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async index({ response, pagination }) {
    const { page, limit } = pagination

    const images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(page, limit)

    return response.status(200).send(images)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      let images = [],

      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar)

        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          images.push(image)

          return response.status(201).send({successes: images, erros: []})
        }

        return response.status(400).send({message: "Não foi possível processar a imagem"})
      }

      let files = await manage_multiple_upload(fileJar)

      await Promise.all(files.successes.map(async file => {
        const image = await Image.create({
          path: file.fileName,
          size: file.size,
          original_name: file.clientName,
          extension: file.subtype
        })

        images.push(image)
      }))

      return response.status(201).send({successes: images, erros: files.erros})

    } catch (err) {
      return response.status(400).send({message: "Não foi possível processar a solicitação"})
    }
  }

  /**
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Response} ctx.response
   */
  async show({ params, response }) {
    const image = await Image.findOrFail(params.id)

    return response.send(image)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async update({ params, request, response }) {
    const image = await Image.findOrFail(params.id)

    try {
      const original_name = request.input('original_name')

      image.merge(original_name)

      await image.save()

      return response.status(200).send(image)
    } catch (err) {
      return response.status(400).send({message: "Não foi possível atualizar a imagem"})
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async destroy({ params, request, response }) {
    const image = Image.findOrFail(params.id)

    try {
      await image.delete()

      let filePath = Helpers.publicPath(`uploads/${image.path}`)

      await fs.unlink(filePath, err => {
        if (!err) await image.delete()
      })

      return response.status(204).send()
    } catch (err) {
      return response.status(500).send({message: "Não foi possível deletar a imagem"})
    }
  }
}

module.exports = ImageController
