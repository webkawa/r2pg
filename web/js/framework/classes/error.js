/* Throwable framework error. 
 * PARAMETERS :
 *  > context       Error context.
 *                  Has to match catalog name on treatment.
 *  > code          Error code.
 *  > params        Error parameters.
 *  > cause         Error cause.                                                */
function Error(context, code, params, cause) {
    
    if (typeof(context) !== "string" || typeof(code) !== "number") {
        context = "fw";
        code = 0;
        params = null;
        cause = null;
    }
    
    /* Error context */
    this.context = context; 
    this.getContext = function() {
        return this.context;
    };
    
    /* Error code */
    this.code = code;
    this.getCode = function() {
        return this.getCode();
    };
    
    /* Error params */
    this.params = params;
    this.getParams = function() {
        return this.params;
    };
    
    /* Error cause */
    this.cause = cause;
    this.getCause = function() {
        return this.cause;
    };
}