/* Framework component method.
 * Memorize a callable function, caracterized by a name and a list of necessary
 * arguments.
 * PARAMETERS :
 *  > ref                   Method reference.
 *  > name                  Method name.                                        
 *  > rw                    Rewritable method (yes if true).                    */

function Method(ref, name, rw) {
    Toolkit.checkTypeOf("Method", "ref", ref, "function");
    Toolkit.checkTypeOf("Method", "name", name, "string");
    Toolkit.checkTypeOf("Method", "rw", rw, "boolean");
    
    /* Reference */
    this.reference = ref;
    this.getReference = function() {
        return this.reference;
    };
    
    /* Name */
    this.name = name.toLowerCase();
    this.getName = function() {
        return this.name;
    };
    
    /* Context */
    this.context;
    this.getContext = function() {
        return this.context;
    };
    this.setContext = function(context) {
        Toolkit.checkTypeOf("Method.setContext", "context", context, "object");
        Toolkit.checkClassOf("Method.setContext", "context", context, Component);
        
        this.context = context;
    };
    
    /* Rewritable */
    this.rw = rw;
    this.isRewritable = function() {
        return this.rw;
    };
    
    /* Method call.
     * PARAMETERS :
     *  > params                Parameters as array.
     * RETURNS :
     *  Implemented function result.                                            */
    this.call = function(params) {
        try {
            return this.getReference().apply(this.context, params);
        } catch (e) {
            var p = {
                name: this.name,
                context: this.context,
                params: params
            };
            throw new Error("cpn", 1, p, e);
        }
    };
}