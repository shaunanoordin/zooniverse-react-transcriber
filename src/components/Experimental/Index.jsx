import React from 'react';

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    
    this.svgWidth = 800;
    this.svgHeight = 500;
    
    this.actors = [
      new Actor('#c33', 400, 250, 40, AVO.SHAPE_CIRCLE),
      new Actor('#39c', 400, 200, 40, AVO.SHAPE_SQUARE),
      
      new Actor('#c33', 170, 240, 40, AVO.SHAPE_SQUARE),
      new Actor('#39c', 200, 230, 40, AVO.SHAPE_SQUARE),
      
      new Actor('#c33', 500, 250, 40, AVO.SHAPE_CIRCLE),
      new Actor('#39c', 520, 250, 40, AVO.SHAPE_CIRCLE),
      new Actor('#fc3', 500, 210, 40, AVO.SHAPE_CIRCLE),
      
      new Actor('#c33', 400, 350, 40, AVO.SHAPE_CIRCLE),
      new Actor('#39c', 380, 360, 40, AVO.SHAPE_SQUARE),
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
      };
    }
    
    else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_SQUARE) {
      let correction = null;
      const projectionAxes = [...objA.getShapeNormals(), ...objB.getShapeNormals()];
      const verticesA = objA.getShapeVertices();
      const verticesB = objB.getShapeVertices();
      for (let i = 0; i < projectionAxes.length; i++) {
        const axis = projectionAxes[i];
        const projectionA = { min: Infinity, max: -Infinity };
        const projectionB = { min: Infinity, max: -Infinity };
        
        for (let j = 0; j < verticesA.length; j++) {
          const valA = dotProduct(axis, verticesA[j]);
          projectionA.min = Math.min(projectionA.min, valA);
          projectionA.max = Math.max(projectionA.max, valA);
        }
        for (let j = 0; j < verticesB.length; j++) {
          const val = dotProduct(axis, verticesB[j]);
          projectionB.min = Math.min(projectionB.min, val);
          projectionB.max = Math.max(projectionB.max, val);
        }
        
        const overlap = Math.max(0, Math.min(projectionA.max, projectionB.max) - Math.max(projectionA.min, projectionB.min));
        if (!correction || overlap < correction.magnitude) {
          const sign = Math.sign((projectionB.min + projectionB.max) - (projectionA.min + projectionA.max));
          correction = {
            magnitude: overlap,
            x: axis.x * overlap * sign,
            y: axis.y * overlap * sign,
          };
        }
      }
      
      if (correction && correction.magnitude > 0) {
        return {
          ax: objA.x - correction.x * fractionA,
          ay: objA.y - correction.y * fractionA,
          bx: objB.x + correction.x * fractionB,
          by: objB.y + correction.y * fractionB,
        };
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
    
    this.getShapeVertices = this.getShapeVertices.bind(this);
    this.getShapeEdges = this.getShapeEdges.bind(this);
    this.getShapeNormals = this.getShapeNormals.bind(this);
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
  
  getShapeVertices() {
    const vertices = [];
    
    //TODO
    if (this.shape === AVO.SHAPE_SQUARE) {
      vertices.push({ x: this.left, y: this.top });
      vertices.push({ x: this.right, y: this.top });
      vertices.push({ x: this.right, y: this.bottom });
      vertices.push({ x: this.left, y: this.bottom });
    }
    
    return vertices;
  }
  
  getShapeEdges() {
    const vertices = this.getShapeVertices();
    if (vertices.length < 2) return [];
    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i+1) % vertices.length];
      edges.push({
        x: p2.x - p1.x,
        y: p2.y - p1.y,
      });
    }    
    return edges;
  }
  
  getShapeNormals() {
    return this.getShapeEdges().map((edge) => {
      const dist = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
      if (dist === 0) return { x: 0, y: 0 };
      return {
        x: -edge.y / dist,
        y: edge.x / dist,
      };
    });
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

function dotProduct(vectorA, vectorB) {
  if (!vectorA || !vectorB) return null;
  return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
}
