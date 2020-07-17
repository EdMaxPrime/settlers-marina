import {useCanvas, useMouse} from "./Canvas";

//constant used for drawing a circle
const TWO_PI = 2 * Math.PI;

/**
 * Props:
 * @x
 * @y
 * @info     parameter to pass to event handler. Optional
 * @onClick  event handler when this gets clicked. The parameter will be props.info
 */
function Clickable(props) {
  //check if it is possible to draw
  const ctx = useCanvas();
  const mouse = useMouse();
  if(ctx == null) return null;
  //if it is possible to draw...
  const {x, y} = props;
  const radius = 12;
  //circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TWO_PI);
  ctx.closePath();
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.fillStyle = "#9D2";
  ctx.fill();
  //plus sign
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x + 6, y);
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + 6);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
  //check for click
  if(mouse.x > x - radius && mouse.x < x + radius && mouse.y > y - radius && mouse.y < y + radius) {
    props.onClick(props.info);
  }
  return null;
}

export default Clickable;