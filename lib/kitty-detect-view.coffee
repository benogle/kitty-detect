module.exports =
class KittyDetectView extends HTMLElement
  initialize: ({@uri}) ->
    # Create message element
    message = document.createElement('div')
    message.textContent = "The KittyDetect package is Alive! It's ALIVE!"
    message.classList.add('message')
    @appendChild(message)

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
