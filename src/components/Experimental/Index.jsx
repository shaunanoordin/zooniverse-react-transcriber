import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ArtInt } from './ArtInt.js';

class Index extends React.Component {
  constructor(props) {
    super(props);
    
    this.grid = [
      [0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,0,0,0,0,0,1,0,0],
      [0,0,1,0,0,0,0,0,1,0,0],
      [0,0,0,1,1,1,1,1,0,0,0],
      [0,0,1,0,0,0,0,0,1,0,0],
      [0,0,0,1,0,0,0,1,0,0,0],
      [0,0,0,0,1,1,1,0,0,0,0],
      [0,0,0,0,1,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0],
    ];
    
    this.start = { x: 5, y: 0, };
    this.goal = { x: 5, y: 8, };
    this.path = ArtInt.findPath(this.start, this.goal, this.grid, true);
    
    const TMP = this.generateRandomMap();
    this.start = TMP.start;
    this.goal = TMP.goal;
    this.grid = TMP.grid;
    this.path = ArtInt.findPath(this.start, this.goal, this.grid, true);
  }
  
  render() {
    return (
      <div className="experimental">
        <table>
        {this.grid.map((row, y) => {
          return (
            <tr>
              {row.map((col, x) => {
                let cellClass = '';
                let cellContent = '';
                
                if (col > 0) cellClass += 'wall ';
                if (this.start.x === x && this.start.y === y) cellContent += 'S';
                if (this.goal.x === x && this.goal.y === y) cellContent += 'G';
                
                const isOnPath = this.path.find((step) => {
                  return step.x === x && step.y === y;
                });
                if (isOnPath) cellContent += '.';
                if (isOnPath) cellClass += 'path ';
                
                return (
                  <td className={cellClass}>
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          );
        })}
        </table>
      </div>
    );
  }
  
  generateRandomMap(width = 9, height = 9) {
    const actualWidth = width * 2 + 1;
    const actualHeight = height * 2 + 1;
    
    let start = { x: Math.floor(actualWidth/2), y: actualHeight-2 };
    let goal = null;
    let grid = [];
    
    let rooms = [];
    rooms.push({ x: start.x, y: start.y, east: null, south: {}, west: null, north: null, contents: null });
    
    const numberOfRooms = Math.ceil(width * height / 1.5);
    
    for (let n = 1; n < numberOfRooms; n++) {
      let curRoomIndex = Math.floor(Math.random() * rooms.length);
      let startRoomIndex = curRoomIndex;
      
      //console.log('---- STEP ' + n + ' ----');
      
      while (true) {
        let room = rooms[curRoomIndex];
        let startDirection = Math.floor(Math.random() * 4);
        
        //console.log('Room ['+room.x+','+room.y+']');
        
        let newRoom = null;
        
        for (let d = 0; d < 4 && !newRoom; d++) {
          let curDirection = (startDirection + d) % 4;
          //console.log('Direction: '+curDirection);
          
          if (curDirection === 0 && !room.east && room.x < actualWidth-2 &&
              !rooms.find(r=> { return r.x === room.x + 2 && r.y === room.y })) {
            newRoom = { x: room.x + 2, y: room.y, east: null, south: null, west: null, north: null, contents: null };
            room.east = newRoom;
            newRoom.west = room;
            rooms.push(newRoom);
            break;
          } else if (curDirection === 1 && !room.south && room.y < actualHeight-2 &&
              !rooms.find(r=> { return r.x === room.x && r.y === room.y + 2 })) {
            newRoom = { x: room.x, y: room.y + 2, east: null, south: null, west: null, north: null, contents: null };
            room.south = newRoom;
            newRoom.north = room;
            rooms.push(newRoom);
            break;
          } else if (curDirection === 2 && !room.west && room.x > 1 &&
              !rooms.find(r=> { return r.x === room.x - 2 && r.y === room.y })) {
            newRoom = { x: room.x - 2, y: room.y, east: null, south: null, west: null, north: null, contents: null };
            room.west = newRoom;
            newRoom.east = room;
            rooms.push(newRoom);
            break;
          } else if (curDirection === 3 && !room.north && room.y > 1 &&
              !rooms.find(r=> { return r.x === room.x && r.y === room.y - 2 })) {
            newRoom = { x: room.x, y: room.y - 2, east: null, south: null, west: null, north: null, contents: null };
            room.north = newRoom;
            newRoom.south = room;
            rooms.push(newRoom);
            break;
          }
        }
        
        //(newRoom) && console.log("OK");
        if (newRoom) break;
        
        //Problems? Go to the next room.
        curRoomIndex = (curRoomIndex + 1) % rooms.length;
        if (startRoomIndex === curRoomIndex) {
          console.error("OH NO");
          break;
        }
      }
    }
    
    
    for (let y = 0; y < actualHeight; y++) {
      grid.push([]);
      for (let x = 0; x < actualWidth; x++) {
        grid[y].push(1);
      }
    }
    
    for (let i = 0; i < rooms.length; i++) {
      let room = rooms[i];
      grid[room.y][room.x] = 0;
      if (room.east) grid[room.y][room.x+1] = 0;
      if (room.south) grid[room.y+1][room.x] = 0;
      if (room.west) grid[room.y][room.x-1] = 0;
      if (room.north) grid[room.y-1][room.x] = 0;
    }
    
    if (rooms.length > 0) {
      goal = { x: rooms[rooms.length-1].x, y: rooms[rooms.length-1].y, };
    }
    
    return { start, goal, grid };
  }
};

export default Index;
