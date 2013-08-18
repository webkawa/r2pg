/* Classic textfield.
 * PARAMETERS :
 *  > container     Component container.
 *  > value         Initial field value. 
 *  > validators    Client-side validators as array.
 *  > gatekeeper    Server-side validator source name.                          */
function cpnTextfield(container, value, validators, gatekeeper) {
    Toolkit.checkTypeOf("cpnTextField", "value", value, "string");
    Toolkit.checkTypeOf("cpnTextField", "validators", validators, "object");
    for (var i = 0; i < validators.length; i++) {
        Toolkit.checkClassOf("cpnTextField", "validators[" + i + "]", validators[i], Validator);
    }
    
    /* Construction */
    var cpn = new Component(container, "data/components/inputs/textfield.xml");
    //cpn.saveSource(new Source("gatekeeper", "agree", gatekeeper));
    
    /* Starter */
    var cpn_init = function() {
        this.quickSelect("field").val(value);
    };
    cpn.saveMethod(new Method(cpn_init, "init", true));
    
    /* Validator */
    var cpn_check = function() {
        var val = this.quickSelect("field").val();
        for (var i = 0; i < validators.length; i++) {
            if (!validators[i].validate(val)) {
                var violation = validators[i].getMessage();
                
                this.log(violation);
                this.quickSelect("info").text(violation);
                this.go("KO");
                return;
            }
        }
        if (typeof(gatekeeper) !== "undefined") {
            
        } else {
            this.go("OK");
            return;
        }
    };
    cpn.saveMethod(new Method(cpn_check, "check", false));
    
    return cpn;
}