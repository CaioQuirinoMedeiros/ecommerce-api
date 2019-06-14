'use strict'

const crypto = use('crypto')
const Helpers = use('Helpers')

/**
 * Generate random string
 *
 * @param {int} length - String length
 */
const randomString = async (length = 40) => {
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
 * @param {FileJar} file
 */

module.exports = { randomString }
