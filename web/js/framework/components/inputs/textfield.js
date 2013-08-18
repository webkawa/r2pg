/* Classic textfield.
 * PARAMETERS :
 *  > container     Component container.
 *  > properties    Field initial properties as object.
 *                   properties.name            : Field name
 *                   properties.value           : Initial field value
 *                   properties.label           : Field label
 *                   properties.description     : Field description
 *  > validators    Client-side validators as array.
 *  > gatekeeper    Server-side validator source URL.                           */
function cpnTextfield(container, properties, validators, gatekeeper) {
    Toolkit.checkTypeOf("cpnTextField", "properties.name", properties.name, "string");
    Toolkit.checkTypeOf("cpnTextField", "validators", validators, "object");
    for (var i = 0; i < validators.length; i++) {
        Toolkit.checkClassOf("cpnTextField", "validators[" + i + "]", validators[i], Validator);
    }
    
    /* Construction */
    var cpn = new Component(container, "data/components/inputs/textfield.xml");
    if (!Toolkit.isNull(gatekeeper)) {
        cpn.saveSource(new Source("gatekeeper", gatekeeper));
    }
    
    /* Starter */
    var cpn_init = function() {
        this.quickSelect("field").attr("name", properties.name);
        this.quickSelect("field").attr("id", properties.name);
        this.quickSelect("label").attr("for", properties.name);
        
        if (!Toolkit.isNull(properties.label))                  this.quickSelect("label").text(properties.label);
        else                                                    this.quickSelect("label").remove();
        
        if (!Toolkit.isNull(properties.description))            this.quickSelect("description").text(properties.description);
        else                                                    this.quickSelect("description").remove();

        if (this.quickSelect("header").has("*").length === 0)   this.quickSelect("header").remove();

        if (!Toolkit.isNull(properties.value))                  this.quickSelect("field").val(properties.value);
    };
    cpn.saveMethod(new Method(cpn_init, "init", true));
    
    /* Validator */
    var cpn_check = function() {
        var val = this.quickSelect("field").val();
        for (var i = 0; i < validators.length; i++) {
            if (!validators[i].validate(val)) {
                var violation = validators[i].getMessage();
                
                this.quickSelect("info").text(violation);
                this.go("KO");
                return;
            }
        }
        if (!Toolkit.isNull(gatekeeper)) {
            this.accessSource("gatekeeper", {value: val});
            return;
        } else {
            this.go("OK");
            return;
        }
    };
    cpn.saveMethod(new Method(cpn_check, "check", false));
    
    /* Agregator */
    var cpn_agree = function() {
        if (this.getSource("gatekeeper").getItemByAlias("Result").text() === "OK") {
            this.go("OK");
        } else {
            var violation = CFG.get("violations", this.getSource("gatekeeper").getItemByAlias("Violation").text());
            this.quickSelect("info").text(violation);
            this.go("KO");
        }
    };
    cpn.saveMethod(new Method(cpn_agree, "agree", false));
    
    /* Blur check */
    var cpn_checkblur = function() {
        if (this.getState() === "Focus" && !this.quickSelect("field").is($(":focus"))) {
            this.quickSelect("field").trigger("blur");
        }
    };
    cpn.saveMethod(new Method(cpn_checkblur, "checkblur", false));
    
    return cpn;
}