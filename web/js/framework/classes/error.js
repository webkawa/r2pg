/* Throwable framework error. 
 * PARAMETERS :
 *  > context       Error context.
 *                  Has to match catalog name on treatment.
 *  > code          Error code.
 *  > params        Error parameters.
 *  > cause         Error cause.                                                */

function Error(context, code, params, cause) {
    
    if (typeof(context) !== "string" || typeof(code) !== "number") {
        context = "core";
        code = 0;
        params = null;
        cause = null;
    };
    
    /* Error context */
    this.context = context; 
    this.getContext = function() {
        return this.context;
    };
    
    /* Error code */
    this.code = code;
    this.getCode = function() {
        return this.code;
    };
    
    /* Error params */
    this.params = params;
    this.getParams = function() {
        return this.params;
    };
    this.getParam = function(i) {
        return this.params[i].toString();
    };
    
    /* Error cause */
    this.cause = cause;
    this.getCause = function() {
        return this.cause;
    };
    
    /* Stack */
    this.stack = printStackTrace();
    this.getStack = function() {
        return this.stack;
    };
    this.setStack = function(e) {
        this.stack = printStackTrace({e: e});
    };
    
    /* Error ID.
     * RETURNS : error full ID.                                                 */
    this.getID = function() {
        return  Toolkit.leadingChars(this.code, 4, "0") + 
                "@" + 
                Toolkit.followingChars(this.context.toUpperCase(), 8, ".");
    };
    
    /* Error causes hierarchy length.
     * PARAMETERS : N/A
     * RETURNS :
     *  Hierarchy size.                                                         */
    this.getCauseLength = function() {
        var i = 0;
        var buff = this.getCause();
        while (buff instanceof Error) {
            i++;
            buff = buff.getCause();
        }
        return i;
    };
}