/*  InputTextfieldBlock
 *  -------------------
 *  Simple textfield block. Includes input zone, label, description, notification
 *  area. Executes real-time controls during typing.                            */

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
        console.log(this.getSourceData("gatekeeper", 'i[class="result"]'));
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