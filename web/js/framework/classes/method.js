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
    
    /* Rewritable */
    this.rw = rw;
    this.isRewritable = function() {
        return this.rw;
    };
    
    /* Method call.
     * PARAMETERS :
     *  > context               Context object.
     *  > params                Parameters as array.
     * RETURNS :
     *  Implemented function result.                                            */
    this.call = function(context, params) {
        try {
            this.getReference().apply(context, params);
        } catch (e) {
            var p = {
                name: this.name,
                context: context,
                params: params
            };
            throw new Error("cpn", 1, p, e);
        }
    };
}