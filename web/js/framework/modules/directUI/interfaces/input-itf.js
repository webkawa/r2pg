/* Input interface
 * Manages focus and blur issues, selection behavior and validation mechanisms.
 * PARAMETERS :
 *  > parameters.field          Input field name (mandatory).
 *  > parameters.notification   Notification area name (mandatory).
 *  > parameters.focus          Focus state (mandatory).
 *  > parameters.ok             OK state (mandatory).
 *  > parameters.ko             KO state (mandatory).
 *  > parameters.checking       Gatekeeper check state.             
 *  > parameters.validators     Validators (as array, mandatory).
 *  > parameters.gatekeeper     Gatekeeper source.
 *  > parameters.erase          Erase at select (as boolean).                   */

function InputITF(parameters) {
    this.log("Loading inputs interface");
    Toolkit.checkTypeOf("InputITF", "parameters.field", parameters.field, "string");
    Toolkit.checkTypeOf("InputITF", "parameters.notification", parameters.notification, "string");
    Toolkit.checkTypeOf("InputITF", "parameters.focus", parameters.focus, "string");
    Toolkit.checkTypeOf("InputITF", "parameters.ok", parameters.ok, "string");
    Toolkit.checkTypeOf("InputITF", "parameters.ko", parameters.ko, "string");
    Toolkit.checkTypeOf("InputITF", "parameters.validators", parameters.validators, "object");
    if (!Toolkit.isNull(parameters.gatekeeper)) {
        Toolkit.checkTypeOf("InputITF", "parameters.checking", parameters.checking, "string");
    }
    
    /*
     *  Focus management.
     *  Checks if focus is still corresponding to real situation at method call,
     *  and executes subsequent triggers.                                       */
    var cpn_refocus = function() {
        var focused = $("*:focus()");
        if (this.getState() === parameters.focus && !this.quickSelect(parameters.field).is(focused)) {
            this.quickSelect(parameters.field).trigger("blur");
            return;
        }
        if (this.getState() !== parameters.focus && this.quickSelect(parameters.field).is(focused)) {
            this.quickSelect(parameters.field).trigger("focus");
            return;
        }
    };
    this.saveMethod(new Method(cpn_refocus, "refocus", false));
    
    /*  Selection behavior.
     *  Process to field cleaning on selection if needed.                       */
    var cpn_select = function() {
        if (parameters.erase) {
            this.quickSelect(parameters.field).val("");
        }
    };
    this.saveMethod(new Method(cpn_select, "select", false));
    
    /*  Standard validator.
     *  Executes a list of validations on the field value, then confirm or call
     *  for server check.                                                       */
    var cpn_validate = function() {
        var value = this.quickSelect(parameters.field).val();
        for (var i = 0; i < parameters.validators.length; i++) {
            if (!parameters.validators[i].validate(value)) {
                this.quickSelect(parameters.notification).text(parameters.validators[i].getMessage());
                
                this.go(parameters.ko);
                return;
            }
        }
        
        if (Toolkit.isNull(parameters.gatekeeper)) {
            this.go(parameters.ok);
            return;
        } else {
            this.go(parameters.checking);
            return;
        }
    };
    this.saveMethod(new Method(cpn_validate, "validate", false));
    
    /*  Server-side check.
     *  Starts the gatekeeper check.                                            */
    var cpn_check = function() {
        var p = {
            value: this.quickSelect(parameters.field).val()
        };
        this.access(parameters.gatekeeper, p);
    };
    this.saveMethod(new Method(cpn_check, "check", false));
    
    /*  Gatekeeper agregator.
     *  Concludes the gatekeeper check.                                         */
    var cpn_agree = function() {
        if (this.getSourceData(parameters.gatekeeper, 'i[class="result"]').text() === "OK") {
            this.go(parameters.ok);
            return;
        } else {
            var v = this.getSourceData(parameters.gatekeeper, 'i[class="message"]').text();
            
            this.quickSelect(parameters.notification).text(CFG.get("violations", v));
            this.go(parameters.ko);
            return;
        }
    };
    this.saveMethod(new Method(cpn_agree, "agree", false));
}

