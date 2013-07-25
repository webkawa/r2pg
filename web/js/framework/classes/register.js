/* Framework component register.
 * Register is a pseudo-class, offering only static methods, with no error-based
 * parameters check.                                                            */

var Register = {
    /* Components list */
    idx: [],
    
    /* Registers a new component.
     * PARAMETERS :
     *  cpn                 Registered component.
     * RETURNS :
     *  Attributed ID.                                                          */
    add: function(cpn) {
        Toolkit.checkTypeOf("Register.add", "cpn", cpn, "object");
        Toolkit.checkClassOf("Register.add", "cpn", cpn, Component);
        
        var id = Register.idx.length;
        Register.idx[id] = cpn;
        return id;
    },
            
    /* Return a component by his ID.
     * PARAMETERS :
     *  id                  Component ID.
     * RETURNS :
     *  Searched component.                                                     */
     get: function(id) {
         if (id >= Register.idx.length) {
             var p = {
                id: id,
                error: "Component ID is superior to register size"
             };
             throw new Error("cpn", 16, p);
         }
         if (typeof(Register.idx[id]) === "undefined") {
             var p = {
                 id: id,
                 error: "Component has been cleaned"
             }
         }
         return Register.idx[id];
     },

     /* Removes a component by his ID.
      * PARAMETERS :
      *  id                 Component ID.
      * RETURNS : N/A                                                           */
     remove: function(id) {
         delete this.idx[id];
     }
};