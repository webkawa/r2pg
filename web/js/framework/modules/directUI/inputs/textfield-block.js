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
 *  > properties.erase          Initial select erasing (true/false).
 *  > validators                Validators as array.
 *  > gatekeeper                Gatekeeper service.                             */

function cpnInputTextfieldBlock(container, properties, validators, gatekeeper) {
    /* Instanciation */
    var cpn = new Component(container, "data/modules/directUI/inputs/textfield-block.xml");
    
    /* Validations */
    Toolkit.checkTypeOf("cpnInputTextfieldBlock", "properties", properties, "object");
    Toolkit.checkTypeOf("cpnInputTextfieldBlock", "properties.id", properties.id, "string");
    if (Toolkit.isNull(validators)) {
        validators = [];
    }
    
    /* Interfacing */
    var p = {
        field: "field",
        notification: "foot",
        focus: "Focus",
        ok: "Ok",
        ko: "Ko",
        checking: "Checking",
        validators: validators,
        gatekeeper: "gatekeeper",
        erase: properties.erase
    };
    cpn.saveInterface(InputITF, p);
    
    /* Initialization */
    var cpn_init = function() {
        /* Sources */
        if (!Toolkit.isNull(gatekeeper)) {
            Toolkit.checkTypeOf("cpnInputTextfieldBlock", "gatekeeper", gatekeeper, "string");
            
            var source = new Source("gatekeeper", gatekeeper, "Ko", ["agree"]);
            cpn.saveSource(source);
        }
        
        /* DOM */
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
    
    /* Return */
    return cpn;
}