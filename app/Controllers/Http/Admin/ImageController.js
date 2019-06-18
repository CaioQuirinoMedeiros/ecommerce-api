'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Image = use('App/Models/Image')
const { manage_single_upload, manage_multiple_upload } = use('App/Helpers')
const fs = use('fs')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')
const Helpers = use('Helpers')

class ImageController {
  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ response, pagination, transform }) {
    const { page, limit } = pagination

    let images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(page, limit)

    try {
      images = await transform.paginate(images, ImageTransformer)

      return response.status(200).send(images)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível buscar as imagens' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const fileJar = request.file('images', {
      types: ['image'],
      size: '2mb'
    })

    let images = []

    try {
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

          images.push(image)
        })
      )

      images = await transform.collection(images, ImageTransformer)

      return response
        .status(201)
        .send({ successes: images, errors: files.errors })
    } catch (err) {
      console.log(err)
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
    try {
      let image = await Image.findOrFail(params.id)

      image = await transform.item(image, ImageTransformer)

      return response.status(200).send(image)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível encontrar a imagem' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async update({ params, request, response, transform }) {
    const original_name = request.input('original_name')

    try {
      let image = await Image.findOrFail(params.id)

      image.merge({ original_name })

      await image.save()

      image = await transform.item(image, ImageTransformer)

      return response.status(200).send(image)
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível editar a imagem' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {object} ctx.params
   */
  async destroy({ params, response }) {
    try {
      const image = await Image.findOrFail(params.id)

      let filePath = Helpers.publicPath(`uploads/${image.path}`)

      await fs.unlink(filePath, err => {
        if (err) throw Error
      })

      console.log(image)

      await image.delete()

      return response.status(204).send()
    } catch (err) {
      console.log(err)
      return response
        .status(400)
        .send({ message: 'Não foi possível deletar a imagem' })
    }
  }
}

module.exports = ImageController
