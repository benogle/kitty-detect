KittyCanvas = require './kitty-canvas'

module.exports =
class KittyDetectView extends HTMLElement
  initialize: ({@uri}) ->
    @canvas = new KittyCanvas
    @appendChild(@canvas.canHazCanvas())

  detect: ->
    @canvas.detectFromURL('atom://kitty-detect/lulz/gracie8.jpg')

  getTitle: ->
    'HUBOT Kitty Detect'

  getURI: -> @uri

  serialize: ->
    deserializer: 'KittyDetectView'
    uri: @getURI()

  destroy: ->
    @remove()

module.exports = document.registerElement 'kitty-detect-view',
  prototype: KittyDetectView.prototype
