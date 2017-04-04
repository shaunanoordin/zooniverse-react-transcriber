/*
Data Organiser
==============

(Shaun A. Noordin || shaunanoordin.com || 20170404)
********************************************************************************
 */

export const DataOrganiser = {
  sortAggregations(aggregations) {
    if (!aggregations || !Array.isArray(aggregations)) return null;
    
    //Group the aggregations by orientation:
    //- Left to Right horizontal lines
    //- Up to Down vertical lines
    //- Down to Up vertical lines
    //----------------------------------------------------------------
    const output_LtoR = aggregations
    .filter(agg => {
      const angle = calculateAngle(agg);
      return -5 <= angle && angle <= 5;
    })
    .sort((a, b) => {
      const a_y = Math.min(a.startY, a.endY);
      const b_y = Math.min(b.startY, b.endY);
      return a_y - b_y;
    });
    
    const output_UtoD = aggregations
    .filter(agg => {
      const angle = calculateAngle(agg);
      return 85 <= angle && angle <= 95;
    })
    .sort((a, b) => {
      const a_x = Math.min(a.startX, a.endX);
      const b_x = Math.min(b.startX, b.endX);
      return b_x - a_x;
    });
    
    const output_DtoU = aggregations
    .filter(agg => {
      const angle = calculateAngle(agg);
      return -95 <= angle && angle <= -85;
    })
    .sort((a, b) => {
      const a_x = Math.min(a.startX, a.endX);
      const b_x = Math.min(b.startX, b.endX);
      return a_x - b_x;
    });
    
    //Let our powers combine!
    let output = [...output_LtoR, ...output_DtoU, ...output_UtoD];
    //----------------------------------------------------------------
    
    //Let's not forget to add the aggregations that don't fall into the standard orientations.
    //----------------------------------------------------------------
    const output_misc = aggregations.filter(agg => {
      return !output.includes(agg);
    });
    output = [...output, ...output_misc];
    //----------------------------------------------------------------
    
    return output;
  }
};

function calculateAngle(agg) {
  const x = agg.endX - agg.startX;
  const y = agg.endY - agg.startY;
  
  return Math.atan2(y, x) / Math.PI * 180;
}
