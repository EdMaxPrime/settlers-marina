// this will be a central export for all of the content (thunks) of particular files from utilities;
/* we export * because each utilities file exports many thunks
   then in the rest of the app, we can just do:
   		import { someThunk, anotherThunk } from "../thunks";
   	rather than:
   		import { someThunk } from "../store/utilities/some";
   		import { anotherThunk } from "../store/utilities/another";
   	The actual thunks are defined in store/utilities/ so the purpose of this folder
   	is to make importing thunks easier in the rest of the app (and nothing will break
   	if we move stuff around in utilities)
   */
export * from "../store/utilities/user";
export * from "../store/utilities/room";
export * from "../store/utilities/chat";