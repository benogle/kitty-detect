KittyCanvas = require './kitty-canvas'

module.exports =
class KittyDetectView extends HTMLElement
  initialize: ({@uri}) ->
    @canvas = new KittyCanvas
    @appendChild(@canvas.getCanvas())

  detect: ->
    @canvas.detectFromURL('atom://kitty-detect/lulz/800w.jpg')

  getTitle: ->
    'Detect Kitten'

  getURI: -> @uri

  serialize: ->
    deserializer: 'KittyDetectView'
    uri: @getURI()

  destroy: ->
    @remove()

module.exports = document.registerElement 'kitty-detect-view',
  prototype: KittyDetectView.prototype
