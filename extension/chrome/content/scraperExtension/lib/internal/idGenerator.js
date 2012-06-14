/**
 * Singleton for id generation for one extension session. Use only for UI classes.
 */
var idGenerator = {
	uniqueCounter:0,
	
	/**
	 * Returns an unique id.
	 * @param {String} A unique id.
	 */
	getID: function(){
		this.uniqueCounter++;
    	return this.uniqueCounter.toString(16);
    }
}