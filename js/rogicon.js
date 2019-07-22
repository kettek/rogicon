let Rogicon = (()=>{
  let R = {
    width: 1,
    height: 1,
    camera_x: 0,
    camera_y: 0,
    cells: [[]],
    tiles: [[]],
    entities: [],
    map: {},
    dirty: true,
    canvas: document.createElement('canvas'),
    link: document.getElementById("rogicon"),
  }

  function setup() {
    R.entities[0] = makeEntity(makeCell(255,255,255))
    R.entities[0].x = 3
    R.entities[0].y = 3

    R.map = makeMap(R.width, R.height)
    makeRooms(R.map, 30)
  }

  function makeEntity(color) {
    return {
      color: color,
    }
  }

  function makeMap(w, h) {
    var m = {
      tiles: [[]],
      width: w,
      height: h,
    }

    for (var x = 0; x < w; x++) {
      m.tiles[x] = []
      for (var y = 0; y < h; y++) {
        m.tiles[x][y] = {
          blocking: true,
          color: makeCell(0,0,0)
        }
      }
    }
    return m
  }

  function randInt(min, max) {
    return Math.floor(min + Math.random() * Math.floor(max))
  }

  function makeRooms(m, max) {
    var rooms = []
    rooms[0] = makeRoom(randInt(0,m.width), randInt(0,m.height), randInt(3,8), randInt(3,8))

    for (var i = 0; i < max; i++) {
      var room = makeRoom(randInt(0,m.width), randInt(0,m.height), randInt(3,8), randInt(3,8))
      var intersects = false
      for (var j = 0; j < rooms.length-1; j++) {
        var lastRoom = rooms[j]
        if (room.x0 <= lastRoom.x1 && room.x1 >= lastRoom.x0 && room.y0 <= lastRoom.y1 && room.y1 >= lastRoom.y0) {
          intersects = true
          break
        }
      }
      if (intersects) {
        continue
      }
      rooms.push(room)
    }

    for (var i = 0; i < rooms.length; i++) {
      var room = rooms[i]
      var roomCenter = getRoomCenter(room)
      placeRoom(m, room)
      if (i == 0) {
      } else {
        var lastCenter = getRoomCenter(rooms[i-1])
        if (randInt(0, 1) == 0) {
          placeTunnel(m, lastCenter.x, roomCenter.x, lastCenter.y, 0)
          placeTunnel(m, lastCenter.y, roomCenter.y, roomCenter.x, 1)
        } else {
          placeTunnel(m, lastCenter.y, roomCenter.y, lastCenter.x, 1)
          placeTunnel(m, lastCenter.x, roomCenter.x, roomCenter.y, 0)
        }
      }
    }
  }

  function getRoomCenter(room) {
    return {
      x: Math.round(room.x0 + (room.x1 - room.x0)/2),
      y: Math.round(room.y0 + (room.y1 - room.y0)/2),
    }
  }

  function placeRoom(m, room) {
    for (var x = room.x0 + 1; x < room.x1; x++) {
      for (var y = room.y0 + 1; y < room.y1; y++) {
        setTile(m, x, y, {
          blocking: false,
          color: makeCell(100, 50, 50),
        })
      }
    }
  }

  function placeTunnel(m, a0, a1, b, dir) {
    if (dir == 0) {
      for (var a = Math.min(a0, a1); a <= Math.max(a0, a1); a++) {
        setTile(m, a, b, {
          blocking: false,
          color: makeCell(75, 50, 50),
        })
      }
    } else {
      for (var a = Math.min(a0, a1); a <= Math.max(a0, a1); a++) {
        setTile(m, b, a, {
          blocking: false,
          color: makeCell(75, 50, 50),
        })
      }
    }
  }

  function setTile(m, x, y, tile) {
    if (x < 0 || x >= m.width || y < 0 || y >= m.height) {
      return
    }
    m.tiles[x][y] = tile
  }

  function makeRoom(x,y,w,h) {
    return {
      x0: x,
      y0: y,
      x1: x+w,
      y1: y+h,
    }
  }

  function update() {
    for (var x = 0; x < R.map.width; x++) {
      for (var y = 0; y < R.map.height; y++) {
        var tile = R.map.tiles[x][y]
        setCell(x, y, tile.color)
      }
    }
    for (var i = 0; i < R.entities.length; i++) {
      setCell(R.entities[i].x, R.entities[i].y, R.entities[i].color)
    }
    R.camera_x = R.entities[0].x
    R.camera_y = R.entities[0].y
  }

  function draw() {
    if (!R.dirty) return
    var ctx = R.canvas.getContext('2d')
    for (var x = 0; x <= R.width; x++) {
      for (var y = 0; y <= R.height; y++) {
        var cx = x + R.camera_x - R.width/2
        var cy = y + R.camera_y - R.height/2
        if (cx < 0 || cy < 0 || cx >= R.map.width || cy >= R.map.height) {
          ctx.fillStyle = 'rgb(0, 0, 0)'
        } else {
          ctx.fillStyle = 'rgb('+R.cells[cx][cy][0]+','+R.cells[cx][cy][1]+','+R.cells[cx][cy][2]+')'
        }
        ctx.fillRect(x, y, 1, 1)
      }
    }
    R.link.href = R.canvas.toDataURL()
    R.dirty = false
  }

  function setSize(w, h) {
    R.width = w
    R.height = h

    R.canvas.width = w
    R.canvas.height = h

    for (var x = 0; x < w; x++) {
      R.cells[x] = []
      for (var y = 0; y < h; y++) {
        R.cells[x][y] = makeCell(0,0,0)
      }
    }
    R.dirty = true
  }

  function setCell(x, y, color) {
    if (!inBounds(x,y) || R.cells[x][y] == color) {
      return
    }
    R.dirty = true
    R.cells[x][y] = color
  }

  function makeCell(r,g,b) {
    return [r,g,b]
  }

  function inBounds(x,y) {
    if (x < 0 || x >= R.width || y < 0 || y >= R.height) {
      return false
    }
    return true
  }

  return (w,h)=>{
    window.addEventListener('keypress', (e) => {
      if (e.key == 'h') {
        R.entities[0].x--
      } else if (e.key == 'l') {
        R.entities[0].x++
      } else if (e.key == 'j') {
        R.entities[0].y++
      } else if (e.key == 'k') {
        R.entities[0].y--
      }
      update()
      draw()
    })
    setSize(w, h)
    setup()
  }
})()
