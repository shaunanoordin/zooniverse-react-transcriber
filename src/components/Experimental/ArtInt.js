export const ArtInt = {
  aStar: function (start, goal, grid) {
    const MIN_X = 0;
    const MIN_Y = 0;
    const MAX_X = Math.max((grid.length > 0) ? grid[0].length - 1 : 0, 0);
    const MAX_Y = Math.max(grid.length - 1, 0);
    let startCell = null;
    let goalCell = null;
    
    const calcGrid = grid.map((row, y) => {
      return row.map((col, x) => {
        const cell = {
          x: x, y: y, val: col,
          from: null, cost: Infinity,
        };
        if (x === start.x && y === start.y) startCell = cell;
        return cell;
      });
    });
    
    let frontier = new PriorityQueue();
    startCell.cost = 0;
    frontier.put(startCell, 0);
    
    while (!frontier.isEmpty()) {
      let current = frontier.get();
      if (!current) break;  //Invalid?
      
      if (current.x === goal.x && current.y === goal.y) {  //Target found!
        goalCell = current;
        break;
      }
      
      //Get neighbours
      let neighbours = [];
      if (current.x - 1 >= MIN_X) neighbours.push(calcGrid[current.y][current.x - 1]);
      if (current.x + 1 <= MAX_X) neighbours.push(calcGrid[current.y][current.x + 1]);
      if (current.y - 1 >= MIN_Y) neighbours.push(calcGrid[current.y - 1][current.x]);
      if (current.y + 1 <= MAX_Y) neighbours.push(calcGrid[current.y + 1][current.x]);
      
      //Select only valid neighbours (floors, not walls)
      neighbours = neighbours.filter((n) => { return n.val === 0; });
      neighbours = this.shuffleArray(neighbours, neighbours.length)
      
      for (let next of neighbours) {
        const DEFAULT_COST = 1;
        const newCost = current.cost + DEFAULT_COST;
        
        if (newCost < next.cost) {
          next.cost = newCost;
          const priority = newCost + this.heuristics(next, goal);
          next.from = current;
          frontier.put(next, priority);
        }
      }
    }
    
    let path = [];
    let curPath = goalCell;
    while (curPath) {
      path.push({ x: curPath.x, y: curPath.y });
      curPath = curPath.from;
    };
    path = path.reverse();
    
    return path;
  },
  
  heuristics: function (cell, goal) {
    return Math.abs(cell.x - goal.x) + Math.abs(cell.y - goal.y);
  },
  
  /* Shuffles an array, n times.
   */
  shuffleArray: function (array, n) {
    if (!array || array.length <= 1) return array;
    let out = array.map(itm => {return itm});
    let cur = n;
    while (cur > 0) {
      const i = Math.floor(Math.random() * out.length);
      const j = Math.floor(Math.random() * out.length);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
      cur--;
    }
    return out;
  },
};

class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  
  isEmpty() {
    return this.elements.length === 0;
  }
  
  put(item, priority) {
    this.elements.push({ item: item, priority: priority });
    this.elements.sort((a, b) => { return a.priority - b.priority; });
  }
  
  get() {
    return this.elements.shift().item;
  }
}