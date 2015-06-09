"use babel";

var path = require('path');
var Task = require('atom').Task
var Kittydar = require('../kittydar/kittydar').Kittydar;

module.exports =
class KittyCanvas {
  constructor() {
    this.kittyCanvas = document.createElement('canvas')
    this.faceCanvas = document.createElement('canvas')
    this.container = document.createElement('div')
    this.container.appendChild(this.kittyCanvas)
    this.container.appendChild(this.faceCanvas)

    this.container.classList.add('kitty-canvas')
  }

  getCanvas() {
    return this.container
  }

  detectFromURL(url) {
    var img = new Image()
    var self = this;
    img.onload = function() {
      self.detectFromImage(img)
    }
    img.src = url
  }

  detectFromImage(img) {
    this.clearFaces()
    this.drawKitty(img)
    this.detectInWorker()
  }

  detectInWorker() {
    var kittydar = new Kittydar()
    if (this.worker) this.worker.terminate()

    var worker = this.worker = new Worker("atom://kitty-detect/lib/kitty-detect-worker.js");
    worker.onmessage = () => {
      var data = event.data;
      if (data.type == 'progress') {
        this.paintFaces(data.cats, "orange");
      }
      else if (data.type == 'result') {
        this.clearFaces()
        this.paintFaces(data.cats, "red");
      }
    }
    worker.onerror = (event) => {
      console.log('fuuu', event.message);
    }

    var resizes = kittydar.getAllSizes(this.kittyCanvas)
    worker.postMessage(resizes)
  }

  drawKitty(img) {
    var width = img.width
    var height = img.height

    var max = Math.max(width, height)
    var scale = Math.min(max, 420) / max

    width *= scale
    height *= scale

    this.kittyCanvas.width = width
    this.kittyCanvas.height = height
    this.faceCanvas.width = width
    this.faceCanvas.height = height

    // draw image to preview canvas
    var context = this.kittyCanvas.getContext("2d")
    context.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height)
  }

  clearFaces() {
    var ctx = this.faceCanvas.getContext("2d");
    ctx.clearRect(0, 0, this.faceCanvas.width, this.faceCanvas.height);
  }

  paintFaces(catFaces, color) {
    var canvas = this.faceCanvas
    var ctx = canvas.getContext("2d")

    ctx.lineWidth = 2
    ctx.strokeStyle = color || "red"

    for (var i = 0; i < catFaces.length; i++) {
      var rect = catFaces[i];
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }
}
