import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ArtInt } from './ArtInt.js';

class Index extends React.Component {
  constructor(props) {
    super(props);
    
    this.grid = [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,0,1,1,0],
      [0,1,1,0,0,0,0,0,1,0],
      [0,1,0,0,0,0,0,0,0,0],
      [0,1,0,1,0,0,0,0,0,0],
      [0,0,0,1,0,0,1,0,1,1],
      [0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,0,0,0,1,0],
      [0,0,0,0,0,0,0,0,0,0],
    ];
    
    this.start = { x: 0, y: 0, };
    this.goal = { x: 9, y: 9, };
    this.path = ArtInt.aStar(this.start, this.goal, this.grid, true);
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
};

export default Index;
