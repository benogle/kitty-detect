"use babel";

var path = require('path')
var Task = require('atom').Task
var Emitter = require('atom').Emitter
var Kittydar = require('../kittydar/kittydar').Kittydar

module.exports =
class KittyCanvas {
  constructor() {
    this.ohai()
  }

  ohai() {
    this.kittyCanvas = document.createElement('canvas')
    this.faceCanvas = document.createElement('canvas')
    this.container = document.createElement('div')
    this.container.appendChild(this.kittyCanvas)
    this.container.appendChild(this.faceCanvas)
    this.container.classList.add('kitty-canvas')
  }

  canHazCanvas() {
    return this.container
  }

  detectKittyFacesInWorker() {
    var kittydar = new Kittydar()
    if (this.worker) this.worker.terminate()

    var queue = new Queue(50)
    var doneQueue = new Queue(100)

    this.worker = new Worker("atom://kitty-detect/lib/kitty-detect-worker.js")
    this.worker.onmessage = () => {
      var data = event.data
      console.log(data);
      if (data.type == 'progress' && data.cats.length) {
        queue.push(() => this.paintFaces(data.cats, "orange"))
        queue.run()
      }
      else if (data.type == 'result' && data.cats.length) {
        console.log('cats');
        doneQueue.push(() => {
          this.clearFaces()
          this.paintFaces(data.cats, "#00cc00")
        })

        var count = 0
        var runAgain = () => {
          if(count == 2)
            doneQueue.run()
          else{
            queue.rerun()
          }
          count++
        }

        queue.push(() => {
          console.log('clear');
          this.clearFaces()
        })
        queue.emitter.on('done', runAgain)
        queue.run()
      }
    }
    this.worker.onerror = (event) => {
      console.log('no kitties found :(', event.message)
    }

    var resizes = kittydar.getAllSizes(this.kittyCanvas)
    this.worker.postMessage(resizes)
  }

  drawKitty(img) {
    var width = img.width
    var height = img.height

    var scale = Math.min(width, 500) / width
    width *= scale
    height *= scale

    this.container.style.width = width + 'px'
    this.container.style.height = height + 'px'
    this.kittyCanvas.width = width
    this.kittyCanvas.height = height
    this.faceCanvas.width = width
    this.faceCanvas.height = height

    // draw image to preview canvas
    var context = this.kittyCanvas.getContext("2d")
    context.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height)
  }

  clearFaces() {
    var ctx = this.faceCanvas.getContext("2d")
    ctx.clearRect(0, 0, this.faceCanvas.width, this.faceCanvas.height)
  }

  paintFaces(catFaces, color) {
    var canvas = this.faceCanvas
    var ctx = canvas.getContext("2d")

    ctx.lineWidth = 2
    ctx.strokeStyle = color || "red"

    for (var i = 0; i < catFaces.length; i++) {
      var rect = catFaces[i]
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    }
  }

  detectFromURL(url) {
    var img = new Image()
    var self = this
    img.onload = function() {
      self.detectFromImage(img)
    }
    img.src = url
  }

  detectFromImage(img) {
    this.clearFaces()
    this.drawKitty(img)
    this.detectKittyFacesInWorker()
  }
}

class Queue {
  constructor(delay) {
    this.events = []
    this.ranEvents = []
    this.delay = delay
    this.isRunning = false
    this.emitter = new Emitter()
  }

  push(event) {
    this.events.push(event)
  }

  rerun() {
    this.events = this.ranEvents
    this.ranEvents = []
    this.run()
  }

  run() {
    if (this.isRunning || this.events.length == 0) {
      return
    }

    this.isRunning = true
    var event = this.events.shift()
    setTimeout(() => {
      event()
      this.ranEvents.push(event)
      this.isRunning = false
      if (this.events.length == 0) this.emitter.emit('done')
      this.run()
    }, this.delay)
  }
}
