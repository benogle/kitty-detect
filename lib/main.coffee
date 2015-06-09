{CompositeDisposable} = require 'atom'
KittyDetectView = null

DETECT_URI = 'atom://kitty-detect'

kittyDetectView = null

module.exports = KittyDetect =
  subscriptions: null

  activate: (state) ->
    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    @subscriptions.add atom.workspace.addOpener (filePath) =>
      return unless filePath is DETECT_URI
      kittyDetectView ?= createKittyDetectView()
      console.log kittyDetectView
      kittyDetectView

  deactivate: ->
    @subscriptions.dispose()
    kittyDetectView.destroy()

atom.commands.add 'atom-workspace', 'kitty-detect:detect', =>
  atom.workspace.open(DETECT_URI, split: 'right')

createKittyDetectView = ->
  KittyDetectView ?= require './kitty-detect-view'
  KittyDetectView = new KittyDetectView
  KittyDetectView.initialize(uri: DETECT_URI)
  KittyDetectView
