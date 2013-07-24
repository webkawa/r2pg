/* Alert component.
 * Displays a simple alert window in the middle of the container.               */

function AlertCPN(container, message, button) {
    var cpn = new Component(container, "js/framework/components/alert.xml");
    
    var cpn_close = function() {
        this.getSelector("message", false).getNodes().append("test");
    };
    cpn.saveMethod(new Method(cpn_close, "close", cpn, false));
    
    return cpn;
};