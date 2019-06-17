'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Image = use('App/Models/Image')
const { manage_single_upload, manage_multiple_upload } = use('App/Helpers')
const fs = use('fs')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')

class ImageController {
  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   * @param {TransformWith} ctx.transform
   */
  async index({ response, pagination, transform }) {
    const { page, limit } = pagination

    let images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(page, limit)

    images = await transform.paginate(images, ImageTransformer)

    return response.status(200).send(images)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    try {
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      let images = []

      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar)

        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          const transformedImage = await transform.item(image, ImageTransformer)

          images.push(transformedImage)

          return response.status(201).send({ successes: images, errors: [] })
        }

        return response
          .status(400)
          .send({ message: 'Não foi possível processar a imagem' })
      }

      let files = await manage_multiple_upload(fileJar)

      await Promise.all(
        files.successes.map(async file => {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          const transformedImage = await transform.item(image, ImageTransformer)

          images.push(transformedImage)
        })
      )

      return response
        .status(201)
        .send({ successes: images, errors: files.errors })
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Não foi possível processar a solicitação' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Response} ctx.response
   */
  async show({ params, response, transform }) {
    let image = await Image.findOrFail(params.id)

    image = await transform.item(image, ImageTransformer)

    return response.send(image)
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async update({ params, request, response, transform }) {
    let image = await Image.findOrFail(params.id)

    try {
      const original_name = request.input('original_name')

      image.merge({ original_name })

      await image.save()

      image = await transform.item(image, ImageTransformer)

      return response.status(200).send(image)
    } catch (err) {
      return response
        .status(400)
        .send({ message: 'Não foi possível atualizar a imagem' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async destroy({ params, response }) {
    const image = Image.findOrFail(params.id)

    try {
      let filePath = Helpers.publicPath(`uploads/${image.path}`)

      await fs.unlink(filePath, async err => {
        if (!err) await image.delete()
      })

      return response.status(204).send()
    } catch (err) {
      return response
        .status(500)
        .send({ message: 'Não foi possível deletar a imagem' })
    }
  }
}

module.exports = ImageController
