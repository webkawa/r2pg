/* InputTextfieldBlock
 * -------------------
 * Simple textfield block. Includes input zone, label, description, notification
 * area. Executes real-time controls during typing.                            
 * PARAMETERS :
 *  > container                 Textfield container.
 *  > properties.id             Textfield ID (mandatory).
 *  > properties.value          Textfield default value. 
 *  > properties.label          Textfield label.
 *  > properties.description    Textfield description.
 *  > properties.initial        Initial select behavior as :
 *                               0/undefined    None
 *                               1              Erase
 *                               2              Select
 *  > validators                Validators as array.
 *  > gatekeeper                Gatekeeper service.                             */

function cpnInputTextfieldBlock(container, properties, validators, gatekeeper) {
    /*
     *  Validations.
     */
    var cpn = new Component(container, "data/modules/directUI/textfield-block.xml");
    Toolkit.checkTypeOf("cpnInputTextfieldBlock", "properties", properties, "object");
    Toolkit.checkTypeOf("cpnInputTextfieldBlock", "properties.id", properties.id, "string");
    if (!Toolkit.isNull(validators)) {
        Toolkit.checkTypeOf("cpnInputTextfieldBlock", "validators", validators, "object");
    }
    if (!Toolkit.isNull(gatekeeper)) {
        Toolkit.checkTypeOf("cpnInputTextfieldBlock", "gatekeeper", gatekeeper, "string");
        
        var source = new Source("gatekeeper", gatekeeper, ["agree"]);
        cpn.saveSource(source);
    }
    
    /*
     *  Initialization.
     */
    var cpn_init = function() {
        this.quickSelect("label").attr("for", properties.id);
        this.quickSelect("field").attr("id", properties.id);
        
        if (!Toolkit.isNull(properties.value)) {
            this.quickSelect("field").text(properties.value);
            this.quickSelect("field").attr("value", properties.value);
        }
        
        if (!Toolkit.isNull(properties.label))          this.quickSelect("label").text(properties.label);
        else                                            this.quickSelect("label").remove();
        
        if (!Toolkit.isNull(properties.description))    this.quickSelect("description").text(properties.description);
        else                                            this.quickSelect("description").remove();
    };
    cpn.saveMethod(new Method(cpn_init, "init", false));
    
    /*
     *  Full focus.
     */
    var cpn_select = function() {
        if (properties.initial === 1) {
            this.quickSelect("field").val("");
        } else if (properties.initial === 2) {
            this.quickSelect("field").select();
        } 
    };
    cpn.saveMethod(new Method(cpn_select, "select", false));
    
    /*
     *  Client validator.
     */
    var cpn_validate = function() {
        var value = this.quickSelect("field").val();
        for (var i = 0; i < validators.length; i++) {
            if (!validators[i].validate(value)) {
                this.go("Ko");
                return;
            }
        }
        
        if (Toolkit.isNull(gatekeeper)) {
            this.go("Ok");
            return;
        } else {
            this.go("Checking");
            return;
        }
    };
    cpn.saveMethod(new Method(cpn_validate, "validate", false));
    
    /* 
     *  Server validator.
     */
    var cpn_check = function() {
        var p = {
            value: this.quickSelect("field").text()
        };
        this.access("gatekeeper", p);
    };
    cpn.saveMethod(new Method(cpn_check, "check", false));
    
    /*
     *  Agregator.
     */
    var cpn_agree = function() {
        if (this.getSourceData("gatekeeper", 'i[class="result"]').text() === "OK") {
            this.go("Ok");
            return;
        } else {
            this.go("Ko");
            return;
        }
    };
    cpn.saveMethod(new Method(cpn_agree, "agree", false));
    
    /*
     *  Focus security.
     */
    var cpn_refocus = function() {
        var focused = $("input:focus");
        if (this.getState() === "Focus" && !this.quickSelect("field").is(focused)) {
            this.quickSelect("field").trigger("blur");
            return;
        }
        if (this.getState() !== "Focus" && this.quickSelect("field").is(focused)) {
            this.quickSelect("field").trigger("focus");
            return;
        }
    };
    cpn.saveMethod(new Method(cpn_refocus, "refocus", false));
    
    /*
     *  Return
     */
    return cpn;
}