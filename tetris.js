var ctx;
var tick;
var blockSpeed = 200/5000;
var entities = [];

function draw() {
  ctx.clearRect(0,0,220,600);
  _.invoke(z, 'draw', ctx);
}  

function update(t) {
  window.requestAnimFrame(update);
  if(!tick) { tick = t; }
  var delta = t - tick;
  tick = t;
  _.invoke(entities, 'update', delta);
  draw();
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       || 
      window.webkitRequestAnimationFrame || 
      window.mozRequestAnimationFrame    || 
      window.oRequestAnimationFrame      || 
      window.msRequestAnimationFrame     || 
      function( callback ){
	window.setTimeout(callback, 1000 / 60);
      };
})()

function tile(x, y, width, height) {
 return({
   x: x,
   y: y,
   width: width,
   height: height,
   draw: function(ctx) {
     ctx.fillRect(this.x, this.y, this.width, this.height);
   }
 });
}

function block() {
  var tiles = [];
  for(var i=0; i<4; i++) {
    var t = tile(0,0,10,10);
    tiles.push({tile: t, offset: {x: 10 * i, y: 0}});
    z.push(t);
  }
  return({
    x: 100,
    y: 10,
    tiles: tiles,
    update: function(delta) {
      this.y = this.y + blockSpeed * delta;
      this.render();
    },
    render: function() {
      _.each(this.tiles, function(t) {
        t.tile.x = this.x + t.offset.x;
        t.tile.y = this.y + t.offset.y;
      }, this);
    }
  }); 
}

var z = [];

window.addEventListener("DOMContentLoaded", function(){
  ctx = document.querySelector("canvas").getContext("2d");

  z.push(tile(10,10,10,10));
  entities.push(block());

  window.requestAnimFrame(update);

});
