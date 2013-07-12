/* Framework component method.
 * Memorize a callable function, caracterized by a name and a list of necessary
 * arguments.
 * PARAMETERS :
 *  > ref                   Method reference.
 *  > name                  Method name.                                        
 *  > rw                    Rewritable method (yes if true)                     */

function Method(ref, name, rw) {
    Toolkit.checkValue("Method", "ref", ref, "object");
    Toolkit.checkValue("Method", "name", name, "string");
    Toolkit.checkValue("Method", "rw", name, "boolean");
    
    /* Reference */
    this.reference = ref;
    this.getReference = function() {
        return this.reference;
    };
    
    /* Name */
    this.name = name;
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