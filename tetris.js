var ctx;
var tick;
var blockSpeed = 20/500;
var freezeDelay = 500;
var blockWidth = 20;
var entities = [];
var z = [];



var grid = {
  // Initialize grid to black and white
  g: _.range(30).map(function(i) {return _.range(11).map(function(j) { return i < 15 ? 1 : 0 })}),
  tiles: [[]],
  touches: function(t1) {
      return _(this.tiles).chain().flatten().any(function(t2) { return collide(t1, t2) && t1.color == t2.color }).value() 
  },
  set: function(row,col,color) {console.log("setting " + row + ", " + col + " to " + color); this.g[row][col] = color},
  update: function(delta) {
    this.render();
  },
  render: function() {
    for(var i=0; i<30; i++) {
      for(var j=0; j<30; j++) {
        this.tiles[i][j].color = this.g[i][j] == 0 ? "black" : "white";
      }
    }
  }
}
for(var i=0; i<30; i++) {
  grid.tiles[i] = [];
  for(var j=0; j<30; j++) {
    var t = tile(j * blockWidth, i * blockWidth, blockWidth, blockWidth, grid.g[i][j]);
    z.push(t);
    grid.tiles[i][j] = t;
  }
}
entities.push(grid);

function collide(t1, t2) {
  return(
    ((t1.x > t2.x + t2.width)  || (t1.x + t1.width  < t2.x) ||
    (t1.y > t2.y + t2.height) || (t1.y + t1.height < t2.y)) ?
    false : true);
}

function draw() {
  ctx.clearRect(0,0,220,600);
  z = _(z).reject(function(elem) {return elem.destroyed});
  _(z).invoke('draw', ctx);
}  

function update(t) {
  window.requestAnimFrame(update);
  if(!tick) { tick = t; }
  var delta = t - tick;
  tick = t;
  entities = _(entities).reject(function(elem) {return elem.destroyed});
  _(entities).invoke('update', delta);
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

function tile(x, y, width, height, color) {
 return({
   x: x,
   y: y,
   width: width,
   height: height,
   color: color || 'black',
   draw: function(ctx) {
     ctx.fillStyle = this.color;
     ctx.fillRect(this.x, this.y, this.width, this.height);
   },
   destroy: function() {
     this.destroyed = true;
   }
 });
}

function block() {
  var tiles = [];
  for(var i=0; i<4; i++) {
    var t = tile(0,0,blockWidth,blockWidth);
    tiles.push({tile: t, offset: {x: blockWidth * i, y: 0}});
    z.push(t);
  }
  var b = { 
    x: 100,
    y: 10,
    velocity: {x: 0, y: blockSpeed},
    tiles: tiles,
    freeze: function() {
      _(this.tiles).each(function(t){
        grid.set(Math.round(t.tile.y / blockWidth), Math.round(t.tile.x / blockWidth), 0);
      });
      entities.push(block());
      this.destroy();
    },
    update: function(delta) {
      if (this.destroyed) {return;}
      this.y = this.y + this.velocity.y * delta;
      this.render();
      this.checkCollision(delta);
    },
    destroy: function() {
      _(this.tiles).chain().map(function(t){return t.tile}).invoke("destroy");
      this.destroyed = true;
    },
    checkCollision: function(delta) {
      if(_(tiles).chain().map(function(t){return t.tile;}).any(function(t1) {return grid.touches(t1)}).value()){
        this.y = this.y - this.velocity.y * delta;
        this.freezeIn = this.freezeIn ? this.freezeIn - delta : freezeDelay;
        if (this.freezeIn <= 0) {
          this.freeze();
        }
      }
    },
    render: function() {
      _(this.tiles).each(function(t) {
        t.tile.x = this.x + t.offset.x;
        t.tile.y = this.y + t.offset.y;
      }, this);
    }
  }; 
  onKeyDown(KEYS["a"], function() {b.x = b.x - blockWidth;});
  onKeyDown(KEYS["d"], function() {b.x = b.x + blockWidth;});
  return b;
}

var KEYS = {
  a: 65,
  d: 68}

function onKeyDown(code, callback) {
  window.addEventListener("keydown", function(e){
    if (e.keyCode == code) { return callback(e); }
  });
}
window.addEventListener("DOMContentLoaded", function(){
  ctx = document.querySelector("canvas").getContext("2d");

  z.push(tile(10,10,10,10));
  entities.push(block());

  window.requestAnimFrame(update);

});
