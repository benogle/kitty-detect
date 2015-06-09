"use babel";
kittydar = require('../kittydar/kittydar');

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
    this.drawKitty(img)
    this.detect()
  }

  detect() {
    var catFaces = kittydar.detectCats(this.kittyCanvas)
    this.paintCatFaces(catFaces)
  }

  paintCatFaces(catFaces) {
    this.clearFaces();
    this.paintFaces(catFaces, "red");
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


var detector = {
  abortCurrent: function() {
    if (this.worker) {
      this.worker.terminate();
    }
  },

  detectCats: function() {
    $("#progress").text("detecting cats...");

    var canvas = $("#preview").get(0);

    if (window.Worker) {
      var worker = new Worker("detection-worker.js");
      worker.onmessage = this.onMessage;
      worker.onerror = this.onError;

      var resizes = kittydar.getAllSizes(canvas);
      worker.postMessage(resizes);

      this.worker = worker;
    }
    else {
      var rects = kittydar.detectCats(canvas);
      this.paintCats(rects);
    }
  },

  paintCats : function(rects) {
    var noun = rects.length == 1 ? "cat" : "cats";
    $("#progress").text(rects.length + " " + noun + " detected");

    this.clearRects();
    this.paintRects(rects, "red");
  },

  clearRects: function() {
    var canvas = $("#annotations").get(0);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },

  paintRects : function(rects, color) {
    var canvas = $("#annotations").get(0);
    var ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.strokeStyle = color || "red";

    for (var i = 0; i < rects.length; i++) {
      var rect = rects[i];
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  },

  onMessage : function(event) {
    var data = event.data;
    if (data.type == 'progress') {
      detector.showProgress(data);
    }
    else if (data.type == 'result') {
      detector.paintCats(data.cats);
    }
  },

  onError : function(event) {
    console.log("Error from detection Worker:", event.message)
  },

  showProgress : function(progress) {
    console.log(progress);
    this.paintRects(progress.rects, "orange");
    $("#progress").text("detecting at " + progress.size + "px...");
  }
}
