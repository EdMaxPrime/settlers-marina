import React from "react";

const CanvasContext = React.createContext(null);
const FrameContext = React.createContext(0);

/**
 * This is the default export. Children can draw on the canvas by accessing
 * the rendering context via useCanvas() or withCanvas(). See below.
 * Please note that the Canvas will not update all children if one of them
 * changes. To clear the canvas and redraw everything, you should wrap the
 * canvas in a parent component which manages all the state.
 *   <Map props...>
 *     <Canvas width, height...>
 *       <Circle />
 *       <Square props from Map... />
 * Props:
 * @width  width in pixels
 * @height  height in pixels
 * @bg  optional, the color to use for background, transparent otherwise
 * @onClick  optional, a click handler that gets {x, y} object
 * @onMove   optional, event fired when mouse moves in the canvas, gets {x, y}
 */
function Canvas(props) {
	//this will contain the canvas DOM element inside .current property
	const canvasRef = React.useRef(null);
	//ratio of physical screen pixels to CSS/canvas pixels
	const dpr = window.devicePixelRatio || 1;
	const {width, height} = props;
	const realWidth = width * dpr, realHeight = height * dpr;
	//renderingContext is canvas drawing API or null
	const [renderingContext, setRenderingContext] = React.useState(null);
	//this will only be run when this component mounts
	React.useEffect(function() {
		if(canvasRef.current !== null) {
			const context2d = canvasRef.current.getContext("2d");
			if(context2d !== null) {
				context2d.scale(dpr, dpr);
				if(typeof props.bg === "string") {
					context2d.fillStyle = props.bg;
					context2d.fillRect(0, 0, realWidth, realHeight);
				} else {
					context2d.clearRect(0, 0, realWidth, realHeight);
				}
				setRenderingContext(context2d);
			}
		}
	}, [dpr]);
	//click handler function
	const onClick = function(event) {
		if(!props.onClick || canvasRef.current == null) return;
		var boundingRect = canvasRef.current.getBoundingClientRect();
		var scaleX = canvasRef.current.width  / canvasRef.current.clientWidth,
		    scaleY = canvasRef.current.height / canvasRef.current.clientHeight;
		var x = scaleX * (event.clientX - Math.round(boundingRect.left)),
		    y = scaleY * (event.clientY - Math.round(boundingRect.top));
		console.log(`Canvas clicked (${x}, ${y})`);
		props.onClick({x: x, y: y});
	};
	//Animations
	const [frameCount, setFrameCount] = React.useState(0);
	React.useEffect(function() {
		let frameID;
		if(props.animate) {
			frameID = requestAnimationFrame(function() {
				setFrameCount(frameCount + 1);
			});
		}
		return function() {
			cancelAnimationFrame(frameID);
		};
	}, [props.animate, frameCount, setFrameCount]);
	//render the canvas
	return (
		<CanvasContext.Provider value={renderingContext}>
		<FrameContext.Provider value={frameCount}>
			<canvas 
				ref={canvasRef} 
				width={Math.floor(dpr * props.width)}
				height={Math.floor(dpr * props.height)}
				style={{width: width + "px", height: height + "px"}}
				onClick={onClick}
			/>
			{props.children}
		</FrameContext.Provider>
		</CanvasContext.Provider>
	);
}

/**
 * This is a custom hook for functional components that need to animate
 * something (like a number). If you want to animate something in a class
 * component, either use state OR abstract the animated part of the drawing
 * into a functional component that uses this hook and is rendered by class.
 * This can be called as many times for as many raw values as you need.
 * If you don't need to animate some value anymore, you should still call this
 * hook BUT pass in a dummy function for valueUpdater that doesn't change initialValue.
 * @param initialValue  the value the animation begins with. This is a constant
 *   which will not be changed
 * @param valueUpdater  a function that transforms the current value into the
 *   next one. It takes as parameters: current value. It returns: updated value.
 *   The very first time the function is called, the current value = initialValue.
 * @return  updated value
 */
function useCustomAnimation(initialValue, valueUpdater) {
	const animatedValue = React.useRef(initialValue);
	animatedValue.current = valueUpdater(animatedValue.current);
	return animatedValue.current;
}

/**
 * This is a custom hook for functional components that need to animate
 * a number. This uses a simple linear interpolation for the value.
 * THIS MUST BE CALLED EVERY RENDER. If you want to conditionally animate
 * something, make it its own conditionally rendered function component.
 * @param start  the initial value
 * @param end    the final value
 * @param duration  time in milliseconds that the animation should last
 * @return   the current value during animation (end value if animation ended)
 */
function useAnimation(start, end, duration) {
	const startTime = React.useRef(Date.now());
	return useAnimation(start, (current) => {
		const progress = Math.min(1, (Date.now() - startTime.current) / duration);
		return start + progress * (end - start);
	});
}

/**
 * EVERY COMPONENT THAT DRAWS ON THE CANVAS MUST CONSUME THIS HOOK. This is a
 * custom hook that must be called once in every functional component.
 */
function useCanvas() {
	React.useContext(FrameContext);
	const renderingContext = React.useContext(CanvasContext);
	return renderingContext;
}

/**
 * This is a Higher Order Component for class-based components that want to
 * draw on the canvas. This HOC wraps your class component. Your class will be
 * provided an extra prop, canvas, which is the actual 2dContext. The first 
 * few times the component renders, canvas may be null; please check canvas
 * is not null before drawing.
 * Usage:
 *  import {withCanvas} from 
 *  class Rectangle {
	  componentDidUpdate() {
	  	 if(this.props.canvas == null) return;
	    this.props.canvas.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
	  }
    }
    export withCanvas(Rectangle);
 */
function withCanvas(Component) {
	return function(props) {
		const renderingContext = useCanvas();
		return <Component canvas={renderingContext} {...props} />;
	};
}

export {Canvas as default, useCanvas, withCanvas, useAnimation, useCustomAnimation};