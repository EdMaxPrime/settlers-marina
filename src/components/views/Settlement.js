import {useCanvas} from "./Canvas";

//mapping player color names to hex color codes
const PLAYER_COLORS = {
  "black"  : "#000",
  "green"  : "#0f0",
  "red"    : "#f00",
  "blue"   : "#00f",
  "orange" : "#FA2",
  "purple" : "#D678FE",
  "white"  : "#fff",
  "cyan"   : "#19C8C6"
};

const ANGLES = [90, 126, 162, 198, 234, 270, 306, 342, 18, 54].map(a => ({
  x: Math.cos(a * Math.PI / 180),
  y: Math.sin(a * Math.PI / 180)
}));

/**
 * Props:
 * @x
 * @y
 * @color  Color string
 */
function Settlement(props) {
  //check if it is possible to draw
  const ctx = useCanvas();
  if(ctx == null) return null;
  //if it is possible to draw...
  const {x, y, color} = props;
  const outerRadius = 12;
  const innerRadius = 6;
  ctx.beginPath();
  ANGLES.forEach((angle, index) => {
    if(index == 0)
      ctx.moveTo(x + outerRadius * angle.x, y + outerRadius * angle.y)
    else if(index % 2 == 0)
      ctx.lineTo(x + outerRadius * angle.x, y + outerRadius * angle.y);
    else
      ctx.lineTo(x + innerRadius * angle.x, y + innerRadius * angle.y);
  });
  ctx.closePath();
  ctx.fillStyle = PLAYER_COLORS[color];
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.stroke();
  return null;
}

export default Settlement;