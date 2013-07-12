/* Framework component.
 * Independant, semi-auto managed front-office component.
 * PARAMETERS :
 *  > wrapper           Component wrapper.
 *  > url               Component structure URL.                                
 *  > methods           Component registered methods as array.                  */

function Component(wrapper, url, methods) {
    Toolkit.checkValue("Component", "wrapper", wrapper, "object");
    Toolkit.checkValue("Component", "url", url, "string");
    Toolkit.checkValue("Component", "methods", methods, "array");
    
    /* Description URL */
    this.url = url;
    this.getUrl = function() {
        return this.url;
    };
    
    /* Description */
    this.data = null;
    
    /* Container */
    this.wrapper = wrapper;
    this.getWrapper = function() {
        return this.wrapper;
    };
    
    /* Registered methods */
    this.methods = [];
    this.getMethod = function(name) {
        for (var i = 0; i < this.methods.length; i++) {
            if (this.methods[i].getName() === name) {
                return this.methods[i];
            }
        }
        var p = {
            name: name
        };
        throw new Error("cnp", 2, p);
    };
    this.addMethod = function(method) {
        for (var i = 0; i < this.methods.length; i++) {
            if (this.methods[i].getName() === method.getName()) {
                if (this.methods[i].isRewritable()) {
                    this.methods[i] = method;
                    return true;
                } else {
                    return false;
                }
            }
            this.methods[this.methods.length] = method;
            return true;
        }
    };
    
    /* Method call tool.
     * PARAMETERS :
     *  > name                  Method name.
     *  > params                Method parameters.
     * RETURN :
     *  Method implemented function result.                                     */
    this.callMethod = function(name, params) {
        this.getMethod(name).call(this, params);
    };
    
    /* Component starter.
     * Process to the following actions :
     *      - Loads component description ;
     *      - Initialize DOM ;
     *      - Launch direct and indirect starting actions.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    this.start = function() {
        
    };
    
    /* Component stopper.
     * Process the following actions :
     *      - Unload component description ;
     *      - Resolve off mode DOM ;
     *      - Launch direct and indirect ending actions.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    this.stop = function() {
        
    };
    
    /* Component restarter.
     * Successively stops and start component.                                  
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    this.restart = function() {
        this.stop();
        this.start();
    };
    
    /* Initializing */
}