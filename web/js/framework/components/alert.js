/* Alert component.
 * Displays a simple alert window in the middle of the container.               */

function AlertCPN(container, message, button) {
    var cpn = new Component(container, "js/framework/components/alert.xml");
    
    var cpn_append = function() {
        this.quickSelect("message").append("test");
    };
    cpn.saveMethod(new Method(cpn_append, "append", cpn, false));
    
    var cpn_plop = function() {
        Log.print(this, "plop");
    };
    cpn.saveMethod(new Method(cpn_plop, "plop", cpn, true));
    
    return cpn;
};