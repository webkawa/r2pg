/* Alert component.
 * Displays a simple alert window in the middle of the container.               */

function AlertCPN(container, message, button) {
    var cpn = new Component(container, "js/framework/components/alert.xml");
    
    var cpn_close = function() {
        console.log("lol");
        this.getSelector("message", false).append("test");
    };
    cpn.saveMethod(new Method(cpn_close, "close", false));
    
    return cpn;
};