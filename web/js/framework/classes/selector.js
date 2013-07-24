/* Framework component selector.
 * Component-linked selector based on a classic jQuery path.
 * PARAMETERS :
 *  > owner                 Owner component.
 *  > name                  Selector name.
 *  > path                  Selector path.                                      
 *  > state                 Parent state (null if component).                   */

function Selector(owner, name, path, state) {
    Toolkit.checkTypeOf("Selector", "owner", owner, "object");
    Toolkit.checkClassOf("Selector", "owner", owner, Component);
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
    
    /* Parent state */
    this.state = state;
    this.getState = function() {
        return this.state;
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
        this.nodes = $(this.owner.getContainer()).find(this.path);
        return this.nodes;
    };
};