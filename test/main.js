// readline module initialization
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// function to parse statements of form "(a,b)"
let parse = (w) => {
  return [
    w.slice(1, -1).split(",")[0].trim(),
    w.slice(1, -1).split(",")[1].trim(),
  ];
};

// async function to get string from user
const gets = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// function to print something without separators
pprint = (args) => process.stdout.write(String(args));

const W = 1;
const B = 1;

class Map {
  constructor(width, height, players) {
    this.width = width;
    this.height = height;
    this.noofp = players.length;
    this.Grid = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    this.biGrid = [
      [W, W, W, W, W, W, W, W, W, W, W],
      [W, 0, 0, 0, 0, W, 0, 0, 0, 0, W],
      [W, 0, 0, 0, 0, W, 0, 0, 0, 0, W],
      [W, 0, 0, 0, 0, W, 0, 0, 0, 0, W],
      [W, 0, 0, 0, 0, W, 0, 0, 0, 0, W],
      [W, 0, 0, 0, 0, W, 0, 0, 0, 0, W],
      [W, 0, 0, 0, 0, W, 0, 0, 0, 0, W],
      [W, W, W, W, W, W, W, W, W, W, W],
    ];

    this.Edges = [];

    this.putg = (x, y, v) => {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
      this.Grid[y][x] = v;
    };

    this.addEdge = (p1, p2) => this.Edges.push((p1, p2));

    this.turn = 0;
    this.cango = (x0, y0, x1, y1, boost) => {
      let p0 = [x0, y0];
      let p1 = [x1, y1],
        p = p1;
      let dp = [p1[0] - p0[0], p1[1] - p0[1]];
      let dx = dp[0];
      let dy = dp[1];

      // check that heighbourhood is allowed
      if (dp[0] * dp[0] + dp[1] * dp[1] >= 4 || (x0, y0) == (x1, y1))
        return false;

      // check if the line is already drawn
      if ([p0, p] in this.Edges || [p, p0] in this.Edges) return false;

      // check if the is a wall
      if (dx > 0 && dy >= 0 && this.biGrid[y0 - 1][x0] == W) return false;
      if (dy > 0 && dx <= 0 && this.biGrid[y0 - 1][x0 - 1] == W) return false;
      if (dx < 0 && dy <= 0 && this.biGrid[y0][x0 - 1] == W) return false;
      if (dy < 0 && dx >= 0 && this.biGrid[y0][x0] == W) return false;

      return true;
    };

    this.go = async (x0, y0) => {
      do {
        let p = [1, 1]; //parse(await gets("Ваш ход: "));
        if (this.cango(x0, y0, p[0], p[1])) {
          this.Edges.push([
            [x0, y0],
            [p[0], p[1]],
          ]);
          x0 = p[0];
          y0 = p[1];
          /* handle player kill
           * ...
           */
        } else {
          console.log("Вы не можете сделать такой ход");
        }

        /* Handle if there is no way to make a turn */
        let flag = 0;
        for (let _y = -1; _y <= 1; _y++)
          for (let _x = -1; _x <= 1; _x++)
            if (this.cango(x0, y0, x0 + _x, y0 + _y)) {
              flag = 1;
              break;
            }
        if (!flag) {
          console.log("Вы проиграли");
          break;
        }
      } while (this.Grid[y0][x0] == 1);
    };
  }
}

const Width = 12,
  Height = 9;

let myMap = new Map(Width, Height, [(2, 2), (Width - 3, Height - 3)]);

for (let y = 0; y < Height - 1; y++)
  for (let x = 0; x < Width - 1; x++) {
    if (myMap.biGrid[y][x] == W) {
      myMap.putg(x, y, B);
      myMap.putg(x, y + 1, B);
      myMap.putg(x + 1, y, B);
      myMap.putg(x + 1, y + 1, B);
    }
  }

for (let y = 0; y < Height; y++, console.log()) {
  for (let x = 0; x < Width; x++) {
    pprint(myMap.Grid[y][x]);
  }
}

myMap.go(2, 2);
