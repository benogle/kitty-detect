KittyCanvas = require './kitty-canvas'

module.exports =
class KittyDetectView extends HTMLElement
  initialize: ({@uri}) ->
    message = document.createElement('div')
    message.textContent = "The KittyDetect package is Alive! It's ALIVE!"
    message.classList.add('message')
    @appendChild(message)

    @canvas = new KittyCanvas
    @appendChild(@canvas.getCanvas())

  detect: ->
    @canvas.detectFromURL('atom://kitty-detect/lulz/wool3.jpg')

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
