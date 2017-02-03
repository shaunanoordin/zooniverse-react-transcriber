import React from 'react';

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    
    this.svgWidth = 800;
    this.svgHeight = 500;
    
    this.actors = [
      new Actor('#c33', 400, 250, 20, AVO.SHAPE_CIRCLE),
      new Actor('#39c', 400, 225, 20, AVO.SHAPE_SQUARE),
      
      new Actor('#fc3', 300, 250, 20, AVO.SHAPE_SQUARE),
      new Actor('#3c9', 290, 240, 20, AVO.SHAPE_SQUARE),
      
      new Actor('#939', 450, 250, 20, AVO.SHAPE_CIRCLE),
      new Actor('#3c3', 460, 250, 20, AVO.SHAPE_CIRCLE),
      new Actor('#9c3', 450, 230, 20, AVO.SHAPE_CIRCLE),
      
      new Actor('#c39', 400, 300, 20, AVO.SHAPE_CIRCLE),
      new Actor('#3cc', 410, 310, 20, AVO.SHAPE_SQUARE),
    ];
    
    this.corrections = [];
    for (let a = 0; a < this.actors.length; a++ ) {
      for (let b = a+1; b < this.actors.length; b++ ) {
        const objA = this.actors[a];
        const objB = this.actors[b];
        
        const correction = this.checkCollision(this.actors[a], this.actors[b]);
        
        if (!!correction) {
          objA.hasCollided = true;
          objB.hasCollided = true;
          
          this.corrections.push(new Actor('#ccc', correction.ax, correction.ay, objA.size, objA.shape));
          this.corrections.push(new Actor('#ccc', correction.bx, correction.by, objB.size, objB.shape));
        }
      }
    }
    this.actors.push(...this.corrections);
  }
  
  /*  Checks if objA is touching objB.
      If true, returns the corrected coordinates for objA and objB, in form:
        { ax, ay, bx, by }
      If false, returns null.
   */
  checkCollision(objA, objB) {
    
    if (!objA || !objB || objA === objB) return null;
    
    let fractionA = 0;
    let fractionB = 0;
    if (!objA.solid || !objB.solid) {
      //If either object isn't solid, there's no collision correction.
    } else if (objA.canBeMoved && objB.canBeMoved) {
      fractionA = 0.5;
      fractionB = 0.5;
    } else if (objA.canBeMoved) {
      fractionA = 1;
    } else if (objB.canBeMoved) {
      fractionB = 1;
    }
    
    if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_CIRCLE) {
      const distX = objB.x - objA.x;
      const distY = objB.y - objA.y;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const minimumDist = objA.radius + objB.radius;
      if (dist >= minimumDist) {
        return null;
      }
      
      const angle = Math.atan2(distY, distX);
      const correctDist = minimumDist;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      return {
        ax: objA.x - cosAngle * (correctDist - dist) * fractionA,
        ay: objA.y - sinAngle * (correctDist - dist) * fractionA,
        bx: objB.x + cosAngle * (correctDist - dist) * fractionB,
        by: objB.y + sinAngle * (correctDist - dist) * fractionB,
      }
    }
    
    return null;
  }
  
  render() {
    return (
      <div>
        <svg viewBox={'0 0 ' + this.svgWidth + ' ' + this.svgHeight} width={this.svgWidth} height={this.svgHeight}>
          <rect x="0" y="0" width={this.svgWidth} height={this.svgHeight} strokeWidth="2" stroke="#999" fill="none" />
          
          {this.actors.map((actor) => {
            switch (actor.shape) {
              case AVO.SHAPE_CIRCLE:
                return (
                  <circle cx={actor.x} cy={actor.y} r={actor.radius} stroke={actor.name} fill={(actor.hasCollided) ? 'rgba(255,128,0, 0.5)' : 'none'} />
                );
              case AVO.SHAPE_SQUARE:
                return (
                  <rect x={actor.left} y={actor.top} width={actor.size} height={actor.size} stroke={actor.name} fill={(actor.hasCollided) ? 'rgba(255,128,0, 0.5)' : 'none'} />
                );
              default:
                return null;
            }
          })}
        </svg>
      </div>
    );
  }
}



/*  Actor Class
 */
//==============================================================================
export class Actor {
  constructor(name = "", x = 0, y = 0, size = 32, shape = AVO.SHAPE_NONE) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
    this.shape = shape;
    this.solid = (shape !== AVO.SHAPE_NONE);
    this.canBeMoved = true;
    this.rotation = AVO.ROTATION_SOUTH;  //Rotation in radians; clockwise positive.
  }
  
  get left() { return this.x - this.size / 2; }
  get right() { return this.x + this.size / 2; }
  get top() { return this.y - this.size / 2; }
  get bottom() { return this.y + this.size / 2; }
  get radius() { return this.size / 2; }
  
  get rotation() { return this._rotation; }
  set rotation(val) {
    this._rotation = val;
    while (this._rotation > Math.PI) { this._rotation -= Math.PI * 2; }
    while (this._rotation <= -Math.PI) { this._rotation += Math.PI * 2; }
  }
  get direction() {  //Get cardinal direction
    //Favour East and West when rotation is exactly SW, NW, SE or NE.
    if (this._rotation <= Math.PI * 0.25 && this._rotation >= Math.PI * -0.25) { return AVO.DIRECTION_EAST; }
    else if (this._rotation > Math.PI * 0.25 && this._rotation < Math.PI * 0.75) { return AVO.DIRECTION_SOUTH; }
    else if (this._rotation < Math.PI * -0.25 && this._rotation > Math.PI * -0.75) { return AVO.DIRECTION_NORTH; }
    else { return AVO.DIRECTION_WEST; }
  }
  set direction(val) {
    switch (val) {
      case AVO.DIRECTION_EAST:
        this._rotation = AVO.ROTATION_EAST;
        break;
      case AVO.DIRECTION_SOUTH:
        this._rotation = AVO.ROTATION_SOUTH;
        break;
      case AVO.DIRECTION_WEST:
        this._rotation = AVO.ROTATION_WEST;
        break;
      case AVO.DIRECTION_NORTH:
        this._rotation = AVO.ROTATION_NORTH;
        break;
    }
  }
}
//==============================================================================


export const AVO = {
  SHAPE_NONE: 0,  //No shape = no collision
  SHAPE_SQUARE: 1,
  SHAPE_CIRCLE: 2,
  ROTATION_EAST: 0,
  ROTATION_SOUTH: Math.PI / 2,
  ROTATION_WEST: Math.PI,
  ROTATION_NORTH: -Math.PI / 2,
  DIRECTION_EAST: 0,
  DIRECTION_SOUTH: 1,
  DIRECTION_WEST: 2,
  DIRECTION_NORTH: 3,
}