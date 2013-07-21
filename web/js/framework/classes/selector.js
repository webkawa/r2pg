/* Framework component selector.
 * Component-linked selector based on a classic jQuery path.
 * PARAMETERS :
 *  > owner                 Owner component.
 *  > name                  Selector name.
 *  > path                  Selector path.                                      */

function Selector(owner, name, path) {
    Toolkit.checkTypeOf("Selector", "owner", owner, "object");
    Toolkit.checkTypeOf("Selector", "name", name, "string");
    Toolkit.checkTypeOf("Selector", "path", path, "string");
    
    /* Owner component */
    this.owner = owner;
    this.getOwner = function() {
        return this.owner;
    };
    
    /* Name */
    this.name = name;
    this.getName = function() {
        return this.name;
    };
    
    /* Path */
    this.path = path;
    this.getPath = function() {
        return this.path;
    };
    
    /* Targets */
    this.nodes = null;
    this.getNodes = function() {
        return this.nodes;
    };
    
    /* Status */
    this.status = false;
    this.getStatus = function() {
        return this.status;
    };
    this.on = function() {
        this.status = true;
    };
    this.off = function() {
        this.status = false;
    };
    
    /* Nodes refresher.
     * Refresh the list of matching nodes for the selector.
     * PARAMETERS : N/A
     * RETURNS :
     *  New nodes list.                                                          */
    this.refresh = function() {
        this.nodes = $(this.owner).find(this.path);
        return this.nodes;
    };
};