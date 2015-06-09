Kittydar = require('../kittydar/kittydar').Kittydar

module.exports = function(kittyImageSizes) {
  kittydar = new Kittydar()
  callback = this.async()

  var cats = [];
  kittyImageSizes.forEach(function(resize) {
    var detected = kittydar.detectAtScale(resize.imagedata, resize.scale)
    cats = cats.concat(detected)

    emit('progress', { size: resize.size, cats: detected })
  });

  cats = kittydar.combineOverlaps(cats, 0.25, 4)
  callback({ cats: cats })
}
