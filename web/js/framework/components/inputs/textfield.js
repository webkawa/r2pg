/* Classic textfield.
 * PARAMETERS :
 *  > container     Component container.
 *  > properties    Field initial properties as object.
 *                   properties.name            : Field name
 *                   properties.value           : Initial field value
 *                   properties.label           : Field label
 *                   properties.description     : Field description
 *  > validators    Client-side validators as array.
 *  > gatekeeper    Server-side validator source name.                          */
function cpnTextfield(container, properties, validators, gatekeeper) {
    Toolkit.checkTypeOf("cpnTextField", "properties.name", properties.name, "string");
    Toolkit.checkTypeOf("cpnTextField", "validators", validators, "object");
    for (var i = 0; i < validators.length; i++) {
        Toolkit.checkClassOf("cpnTextField", "validators[" + i + "]", validators[i], Validator);
    }
    
    /* Construction */
    var cpn = new Component(container, "data/components/inputs/textfield.xml");
    //cpn.saveSource(new Source("gatekeeper", "agree", gatekeeper));
    
    /* Starter */
    var cpn_init = function() {
        if (!Toolkit.isNull(properties.value)) {
            this.quickSelect("field").val(properties.value);
        }
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
        if (!Toolkit.isNull(properties.value)) {
            
        } else {
            this.go("OK");
            return;
        }
    };
    cpn.saveMethod(new Method(cpn_check, "check", false));
    
    return cpn;
}