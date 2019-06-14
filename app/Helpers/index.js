'use strict'

const crypto = use('crypto')
const Helpers = use('Helpers')

/**
 * Generate random string
 *
 * @param {int} length - String length
 */
const random_string = async (length = 40) => {
  let string = ''
  let len = string.length

  if (len < length) {
    let size = length - len
    let bytes = await crypto.randomBytes(size)
    let buffer = Buffer.from(bytes)
    string += buffer
      .toString('base64')
      .replace(/[^a-zA-z0-9]/g, '')
      .substr(0, size)
  }

  return string
}

/**
 * Move a single file to a specified path, if no path is specified
 * then 'public/uploads' will be used
 * @param {FileJar} file the file to be managed
 * @param {string} path the path where the file should be moved in
 * @return {Object<FileJar>}
 */
const manage_single_upload = async (file, path = null) => {
  path = path ? path : Helpers.publicPath('uploads')

  const random_name = await random_string(30)

  const filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

  await file.move(path, {
    name: filename
  })

  return file
}

/**
 * Move multiple files to a specified path, if no path is specified
 * then 'public/uploads' will be used
 * @param {FileJar} fileJar the files to be managed
 * @param {string} path the path where the file should be moved in
 * @return {Object}
 */
const manage_multiple_files = async (fileJar, path = null) => {
  path = path ? path : Helpers.publicPath('uploads')

  let success = []
  let erros = []

  await Promise.all(
    fileJar.files.map(async file => {
      const random_name = await random_string(30)
      const filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

      await file.move(path, {
        name: filename
      })

      if (file.moved()) {
        success.push(file)
      } else {
        erros.push(file.error())
      }
    })
  )

  return { successes, errors }
}

module.exports = { randomString, manage_single_upload, manage_multiple_files }
