/* Alert component.
 * Displays a simple alert window in the middle of the container.               
 * PARAMETERS :
 *  container               Component container.
 *  type                    Alert type.
 *  message                 Alert message.
 *  button                  Button label.                                       
 *  title                   Alert facultative title.                            */

function AlertCPN(container, type, message, button, title) {
    var cpn = new Component(container, "data/components/alert.xml");
    
    Toolkit.checkTypeOf("AlertCPN", "type", type, "string");
    Toolkit.checkTypeOf("AlertCPN", "message", message, "string");
    Toolkit.checkTypeOf("AlertCPN", "button", button, "string");
    if ($(cpn.getContainer()).css("position") !== "relative") {
        var p = {
            id: cpn.getID(),
            position: $(cpn.getContainer()).css("position")
        };
        throw new Error("cpn", 17, p);
    };
    
    /* Initiates alert.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    var cpn_init = function() {
        $(this.quickSelect("window")).addClass(type);
        $(this.quickSelect("message")).text(message);
        $(this.quickSelect("button")).text(button);
        if (typeof(title) === "undefined") {
            $(this.quickSelect("title")).remove();
        } else {
            $(this.quickSelect("title")).text(title);
        }
    };
    cpn.saveMethod(new Method(cpn_init, "init", cpn, false));
    
    /* Focus popin window.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    var cpn_focus = function() {
        var containerIH = $(this.getContainer()).innerHeight();
        var windowOH = $(this.quickSelect("window")).outerHeight(false);
        var windowMT = (containerIH - windowOH) / 2;
        
        $(this.quickSelect("window")).css("margin-top", windowMT + "px");
    };
    cpn.saveMethod(new Method(cpn_focus, "focus", cpn, true));
    
    return cpn;
};