
/**
 * This redux middleware uses socket.io as a transport for redux actions. You
 * specify which redux actions to send as events to socket.io server, and which
 * socket.io events to turn into redux actions.
 * This middleware also adds some special actions to Redux:
 *   - SE_LISTEN: convert some socket.io events into actions
 *   - SE_IGNORE: stop converting some socket.io events into actions
 *   - SE_BUFFER: instead of dispatching actions after socket.io events, buffer them
 *   - SE_FLUSH: dispatch buffered socket.io events as actions
 * @param socket  a socket.io client
 * @param options  an object with the following properties:
 *   - actions: string that should match the action.type to trigger the execute()
 *      default: "server/"
 *   - events: list of event names to begin listening to; does nothing if empty
 *      default: "action"
 *   - action2event: function to handle actions that match the prefix
 *      - eventName: action.type without prefix
 *      - action: the original action object that matched
 *      - emit(event, data...): sends data over socket.io
 *      - store: contains .dispatch() and .getState() methods
 *      default: emits action to server, doesn't propogate into redux store
 *   - event2action: function to handle events received from socket.io, it will
 *      not be called if the event was ignored, buffered or flushed 
 *      - eventName: socket.io event name
 *      - data: first argument received from event
 *      - emit(event, data...): sends data over socket.io
 *      - store: contains .dispatch() and .getState() methods
 *      default: dispatches event data as a redux action
 */
export default function createSocketMiddleware(socket, options) {
	//A Map<String: Array> to hold buffered events. The keys are buffer names,
	//the values are arrays of data received from the server.
	var bufferedEvents = {};
	//This is like a signal mask on Unix processes. The keys are event names.
	//Whenever an event is received from the server, what happens to the data
	//depends on the event status. It can be in 3 states:
	//  false: this event is discarded
	//  true: this event is dispatched as a redux action, must have .type
	//  string: this event is being buffered under a certain name; data is put
	//    in the bufferedEvents bucket until it is flushed.
	//if an event is not in this mask, then the client isn't listening to it
	var eventStatus = {}; //map {eventName: <bufferName> | false | true}
	//socket.io's emit() function to be passed to execute handler
	const _emit = socket.emit.bind(socket);
	//default values for options
	options = options || {};
	//prefix a redux action.type with this string to trigger the execute()
	const prefix = (typeof options.prefix === "string")? options.prefix:"server/";
	//The default handler for actions that match the prefix is to emit them to
	//the server.
	const execute = options.action2event || function(eventName, action, emit, store) {
		emit(eventName, action);
	};
	//The default handler for socket.io server-sent events that aren't blocked
	//dispatches the first argument
	const creator = options.event2action || function(eventName, data, emit, store) {
		store.dispatch(data);
	};
	return store => {
		const eventReceived = (eventName, data) => {
			if(typeof data.type === "string") {
				if(eventStatus[eventName] === false) {
					return;
				}
				else if(typeof eventStatus[eventName] === "string") {
					bufferedEvents[ eventStatus[eventName] ].push(data);
				}
				else {
					creator(eventName,
						    data,
							_emit,
							store);
				}
			}
		};
		const handleEvent = eventName =>
			socket.on(eventName, data => eventReceived(eventName, data));
		//initial list of events to listen to
		iterateOver(options.events, e => {
			handleEvent(e);
			eventStatus[e] = true;
		}, "action");
		return next => action => {
			//make sure this is a valid action
			if(typeof action === "object" && typeof action.type === "string") {
				//if this is an event that needs to be sent to the server, call
				//the execute handler to determine its fate
				if(action.type.indexOf(prefix) === 0) {
					execute(action.type.substring(options.prefix.length),
					        action,
					        _emit,
					        {
					        	dispatch: a => (a == action)? 
					        	next(action) : store.dispatch(a),
					        	getState: store.getState
					        })
				}
				/* This action tells the middleware to start buffering events
				{
					type: "SE_BUFFER",
					buffer: the string name of a new or existing buffer
					events: array or single string name of server-sent events to
					buffer under this name. Overrides previous event status.
				}*/
				else if(action.type === "SE_BUFFER") {
					//expects name, events
					iterateOver(action.events, function(e) {
						//create buffer if it does not exist
						if(!Array.isArray(bufferedEvents[e]))
							bufferedEvents[e] = [];
						//listen for event if not previously listening
						if(eventStatus[e] === undefined) 
							handleEvent(e);
						eventStatus[e] = action.buffer;
					});
				}
				/* This action sequentially releases buffered events in the order
				they were received.
				{
					type: "SE_FLUSH",
					buffer: name of the buffer to flush (silent failure if it doesn't exist)
					clear: true if you want to stop buffering all events associated
					with this buffer, otherwise future events will still buffer
				}
				*/
				else if(action.type === "SE_FLUSH") {
					iterateOver(bufferedEvents[action.buffer], function(a) {
						store.dispatch(a);
					});
					bufferedEvents[action.buffer] = [];
					if(action.clear) {
						for(let eventName in eventStatus) {
							if(eventStatus[eventName] === action.buffer)
								eventStatus[eventName] = true;
						}
					}
				}
				/* All events received from the server that match these names
				will be discarded. Overrides buffer or listen status
				{
					type: "SE_IGNORE",
					events: string or array of string names of events
				}
				*/
				else if(action.type === "SE_IGNORE") {
					iterateOver(action.events, function(e) {
						//listen for event if not previously listening
						if(eventStatus[e] === undefined)
							handleEvent(e);
						eventStatus[e] = false;
					})
				}
				/* Events received from the server that match these names will
				be dispatched as actions. Overrides buffer or ignore status
				{
					type: "SE_LISTEN",
					events: string or array of string names of events
				}*/
				else if(action.type === "SE_LISTEN") {
					iterateOver(action.events, function(e) {
						//listen for event if not previously listening
						if(eventStatus[e] === undefined)
							handleEvent(e);
						eventStatus[e] = true;
					});
				}
				//propogate actions unrelated to this middleware
				else {
					next(action);
				}
			}
		};
	};
}

/**
 * Utility function to loop over an array or single item. Undefined data will
 * be ignored, unless you provide a default value
 * @param stuff  an array or single item
 * @param callback  a function that will be the loop body. Receives parameters:
 *   - item: current iterator
 *   - index: index in the array (0 if single)
 *   - array: the original array, wrapped to be an array if original was single
 * @param options  an object
 *   - defaults: single item or array to be used as "stuff" if stuff is undefined
 */
var iterateOver = (stuff, callback, options) => {
	if(Array.isArray(stuff)) {
		for(let i = 0; i < stuff.length; i++) 
			callback(stuff[i], i, stuff);
	} 
	else if(stuff !== undefined) {
		callback(stuff, 0, [stuff]);
	}
	else if(options && options.defaults) {
		iterateOver(options.defaults, callback);
	}
};