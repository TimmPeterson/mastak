class _point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export function eqto(p1, p2) {
  if (p1.x == p2.x && p1.y == p2.y) return true;
  return false;
}

class _edge {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }
}

export const point = (x, y) => new _point(x, y);
const edge = (p1, p2) => new _edge(p1, p2);

export class field {
  static fromJSON(json) {
    //const data = JSON.parse(json);
    return Object.assign(new field(), json);
  }

  constructor(walls, frameSize, positions) {
    if (walls != undefined) {
      this.boxsize = 64;
      this.gapsize = 5;
      this.frameSize = frameSize;
      this.width = this.height = frameSize / this.boxsize;
      this.positions = positions;
      this.walls = walls;
      this.grid = [];
      for (let y = 0; y < this.width; y++) {
        for (let x = 0; x < this.width; x++) {
          this.grid[y] = [];
          this.grid[y][x] = 0;
        }
      }
      this.edges = [];
      this.buildEdges();
      this.turn = 0;

      for (let p of positions) {
        this.grid[p.y][p.x] = 1;
      }

      this.loosers = [];
    }
  }

  buildEdges() {
    this.edges = [];
    for (let y = 0; y < this.width; y++)
      for (let x = 0; x < this.width; x++)
        if (this.walls[y][x] == 1) {
          this.edges.push(edge(point(x, y), point(x + 1, y)));
          this.edges.push(edge(point(x, y), point(x, y + 1)));
          this.edges.push(edge(point(x + 1, y + 1), point(x + 1, y)));
          this.edges.push(edge(point(x + 1, y + 1), point(x, y + 1)));
          this.grid[y][x] = 1;
          this.grid[y][Math.min(x + 1, this.width - 1)] = 1;
          this.grid[Math.min(y + 1, this.width - 1)][x] = 1;
          this.grid[Math.min(y + 1, this.width - 1)][
            Math.min(x + 1, this.width - 1)
          ] = 1;
        }
  }

  drawBox(frame, x, y, type) {
    let r, g, b;
    if (type == 0) {
      r = 255;
      g = 255;
      b = 255;
    }
    if (type == 1) {
      r = 128;
      g = 128;
      b = 128;
    }
    if (type == 2) {
      r = 220;
      g = 220;
      b = 220;
    }
    frame.putRect(
      this.gapsize + x * (this.boxsize + this.gapsize),
      this.gapsize + y * (this.boxsize + this.gapsize),
      this.boxsize,
      this.boxsize,
      r,
      g,
      b
    );
  }

  drawEdge(frame, x1, y1, x2, y2, type) {
    let r, g, b;
    (r = 0), (g = 0), (b = 0);
    //   if (x1 == x2) {
    //     frame.putVLine(x1, min(y1, y2), max(y1, y2), r, g, b);
    //   } else if (y1 == y2) {
    //     frame.putHLine(y1, min(x1, x2), max(x1, x2), r, g, b);
    //   } else if ((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) == 2) {
    //   }
    frame.putDLine(
      this.gapsize / 2 + x1 * (this.boxsize + this.gapsize),
      this.gapsize / 2 + y1 * (this.boxsize + this.gapsize),
      this.gapsize / 2 + x2 * (this.boxsize + this.gapsize),
      this.gapsize / 2 + y2 * (this.boxsize + this.gapsize),
      r,
      g,
      b,
      5
    );
  }

  draw(frame, playerNo) {
    //frame.putRect(0, 0, frame.width, frame.width, 0, 255, 0);

    for (let x = 0; x < this.width; x++) {
      frame.putDLine(
        this.gapsize / 2 + x * (this.boxsize + this.gapsize),
        0,
        this.gapsize / 2 + x * (this.boxsize + this.gapsize),
        this.frameSize + this.gapsize * (this.width + 1),
        220,
        220,
        220,
        this.gapsize
      );
      frame.putDLine(
        0,
        this.gapsize / 2 + x * (this.boxsize + this.gapsize),
        this.frameSize + this.gapsize * (this.width + 1),
        this.gapsize / 2 + x * (this.boxsize + this.gapsize),
        220,
        220,
        220,
        this.gapsize
      );
    }
    for (let y = 0; y < this.width; y++)
      for (let x = 0; x < this.width; x++)
        this.drawBox(frame, x, y, this.walls[y][x]);
    for (let e of this.edges) {
      this.drawEdge(frame, e.p1.x, e.p1.y, e.p2.x, e.p2.y, 0);
    }

    for (let i in this.positions) {
      let p = this.positions[i];
      if (i == this.turn) {
        frame.putRect(
          this.gapsize / 2 + p.x * (this.boxsize + this.gapsize) - 18,
          this.gapsize / 2 + p.y * (this.boxsize + this.gapsize) - 18,
          37,
          37,
          0,
          128,
          255
        );
      }
      let r, g, b;
      if (this.loosers.includes(Number(i))) (r = 255), (g = 0), (b = 0);
      else (r = 0), (g = 0), (b = 0);
      frame.putRect(
        this.gapsize / 2 + p.x * (this.boxsize + this.gapsize) - 10,
        this.gapsize / 2 + p.y * (this.boxsize + this.gapsize) - 10,
        21,
        21,
        r,
        g,
        b
      );
      if (i == playerNo) {
        frame.putRect(
          this.gapsize / 2 + p.x * (this.boxsize + this.gapsize) - 4,
          this.gapsize / 2 + p.y * (this.boxsize + this.gapsize) - 4,
          9,
          9,
          255,
          200,
          0
        );
      }
    }
  }

  // // async function to get string from user
  // const gets = (question) => {
  //   return new Promise((resolve) => {
  //     rl.question(question, (answer) => {
  //       resolve(answer);
  //     });
  //   });
  // };

  mouseCoord() {
    return new Promise((resolve) => {
      let canvas = document.getElementById("gameCanvas");
      canvas.onclick = (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX =
          ((event.clientX - rect.left) / (rect.right - rect.left)) *
          canvas.width;
        const mouseY =
          ((event.clientY - rect.top) / (rect.bottom - rect.top)) *
          canvas.height;
        resolve({
          x:
            1 +
            Math.floor(
              (mouseX - this.boxsize / 2) / (this.boxsize + this.gapsize)
            ),
          y:
            1 +
            Math.floor(
              (mouseY - this.boxsize / 2) / (this.boxsize + this.gapsize)
            ),
        });
      };
    });
  }

  checkedge(x1, y1, x2, y2) {
    let p1 = point(x1, y1);
    let p2 = point(x2, y2);

    for (let e of this.edges) {
      if (
        (eqto(e.p1, p1) && eqto(e.p2, p2)) ||
        (eqto(e.p1, p2) && eqto(e.p2, p1))
      )
        return true;
    }
    return false;
  }

  cango(x0, y0, x1, y1) {
    let dx = x1 - x0;
    let dy = y1 - y0;

    // check that heighbourhood is allowed
    if (dx * dx + dy * dy >= 4 || (dx == 0 && dy == 0)) return false;

    // check if the line is already drawn
    if (this.checkedge(x0, y0, x1, y1)) return false;

    // check if the is a wall
    if (dx > 0 && dy >= 0 && this.walls[y0][x0] == 1) return false;
    if (dy > 0 && dx <= 0 && this.walls[y0][x0 - 1] == 1) return false;
    if (dx < 0 && dy <= 0 && this.walls[y0 - 1][x0 - 1] == 1) return false;
    if (dy < 0 && dx >= 0 && this.walls[y0 - 1][x0] == 1) return false;

    return true;
  }

  async go(frame, socket, playerNo) {
    let flag;
    let x0 = this.positions[this.turn].x;
    let y0 = this.positions[this.turn].y;
    do {
      flag = 0;
      console.log("do turn: ");
      let p = await this.mouseCoord();

      if (this.cango(x0, y0, p.x, p.y)) {
        for (let i in this.positions) {
          if (eqto(this.positions[i], p)) {
            if (!this.loosers.includes(i)) this.loosers.push(Number(i));
            //alert(`You have eaten player #${i}`);
            if (this.loosers.length == this.positions.length - 1) {
              socket.send("gameEnded", {
                userName: sessionStorage.getItem("userName"),
                roomName: sessionStorage.getItem("roomName"),
              });
              alert("MASTAK!!!");
              if (sessionStorage.getItem("isadmin") === "true")
                window.location.href = "admin_room.html";
              else window.location.href = "member_room.html";
            }
          }
        }

        flag = this.grid[p.y][p.x];
        this.edges.push(edge(point(x0, y0), point(p.x, p.y)));
        this.grid[p.y][p.x] = 1;
        x0 = p.x;
        y0 = p.y;
        this.positions[this.turn].x = x0;
        this.positions[this.turn].y = y0;
      } else {
        flag = 1;
        alert("You can't go there");
      }
      this.draw(frame, playerNo);
    } while (flag == 1);
    console.log("turn is done");
    this.turn = (this.turn + 1) % this.positions.length;
    while (this.loosers.includes(this.turn))
      this.turn = (this.turn + 1) % this.positions.length;
    this.draw(frame, playerNo);
  }
}
