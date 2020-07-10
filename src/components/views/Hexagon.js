import {useCanvas} from "./Canvas";

//mapping tile type to its fill color
const COLORS = {
  'W': "#084000",
  'C': "#CD4832",
  'M': "#4C4C4C",
  'H': "#438B00",
  'G': "#E2C227",
  'D': "#F59946",
  'O': "#007FDF"
};

function Hexagon(props) {
  //check if it is possible to draw
  const ctx = useCanvas();
  if(ctx == null || typeof COLORS[props.tileType] !== "string") return null;
  //if it is possible to draw...
  const {radius} = props;
  ctx.beginPath();
  [30, 90, 150, 210, 270, 330].forEach((angle, index) => {
    let x = props.x + radius * Math.cos(angle * Math.PI / 180),
        y = props.y + radius * Math.sin(angle * Math.PI / 180);
    if(index == 0)
      ctx.moveTo(x, y);
    else
      ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.strokeStyle = "#000";
  ctx.stroke();
  ctx.fillStyle = COLORS[props.tileType];
  ctx.fill();
  return null;
}

export default Hexagon;