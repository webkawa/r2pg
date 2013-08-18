/* Framework validator.
 * PARAMETERS :
 *  > type              Validator type based on the following list.
 *                       MINLENGTH      : Minimum string length [int length]
 *                       MAXLENGTH      : Maximum string length [int length]
 *                       INTLENGTH      : Intermediate string length [int min, int max]
 *                       ALPHA          : Only alphabetic characters []
 *                       ALPHANUMERIC   : Only alphabetic and numeric characters []
 *                       ALPHAEXTENDED  : Only alphabetic, numeric and ponctuation characters []
 *                       NUMERIC        : Numeric string []
 *                       NUMERICPOS     : Positive numeric string [].                                              
 *  > parameters        Validator parameters.                                   
 *  > violation         Violation message, including wildcards ($param$).       */

function Validator(type, parameters, violation) {
    switch (type) {
        case "MINLENGTH": 
            Toolkit.checkTypeOf("Validator", "parameters.min", parameters.length, "number");
            break;
        case "MAXLENGTH": 
            Toolkit.checkTypeOf("Validator", "parameters.max", parameters.length, "number");
            break;
        case "INTLENGTH":
            Toolkit.checkTypeOf("Validator", "parameters.min", parameters.min, "number");
            Toolkit.checkTypeOf("Validator", "parameters.max", parameters.max, "number");
            break;
        case "ALPHA": break;
        case "ALPHANUMERIC": break;
        case "ALPHAEXTENDED": break;
        case "NUMERIC": break;
        case "NUMERICPOS": break;
        default: 
            var p = {
                type: type
            };
            throw new Error("cpn", 24, p);
    }
    
    
    /*
     *  Validator type.
     */
    this.type = type;
    this.getType = function() {
        return this.type;
    };
    
    /*
     *  Validator parameters.
     */
    this.parameters = parameters;
    this.getParameters = function() {
        return this.parameters;
    };
    
    /* Validtor.
     * Checks a value for the current validator.
     * PARAMETERS :
     *  > value         Checked value.
     * RETURN :
     *  true if validation successfull, false else.                              */
    this.validate = function(value) {
        try {
            switch (this.type) {
                case "MINLENGTH": 
                    return value.length >= this.parameters.length;
                case "MAXLENGTH": 
                    return value.length <= this.parameters.length;
                case "INTLENGTH":
                    return value.length >= this.parameters.min && value.length <= this.parameters.max;
                case "ALPHA":
                    return /[A-Za-z]/.test(value);
                case "ALPHANUMERIC":
                    return /[A-Za-z0-9]/.test(value);
                case "ALPHAEXTENDED": 
                    return /[A-Za-z0-9,.:;!\?]/.test(value);
                case "NUMERIC":
                    return parseInt(value).toString() !== "NaN";
                case "NUMERICPOS":
                    return parseInt(value).toString() !== "NaN" && value > 0;
            };
        } catch (e) {
            return false;
        }
    };
    
    /* Violation message generator.
     * Completes the violation message.
     * PARAMETERS :
     *  > message           Violation message.
     * RETURNS :
     *  Enriched violation message.                                             */
    this.report = function(message) {
        var i, j, buff;
        i = message.indexOf("$");
        while (i !== -1) {
            j = message.indexOf("$", i + 1);
            if (j === -1) {
                return message;
            } else {
                buff = message.substring(i, j + 1);
                console.log(this.parameters);
                if (typeof(this.parameters[buff.replace(/\$/g, "")]) === "undefined") {
                    var p = {
                        variable: buff.replace(/\$/g, ""),
                        type: this.type,
                        message: message
                    };
                    throw new Error("cpn", 25, p);
                }
                message = message.replace(buff, this.parameters[buff.replace(/\$/g, "")]);
            }
            i = message.indexOf("$");
        }
        return message;
    };
    
    /* Message */
    this.message = this.report(violation);
    this.getMessage = function() {
        return this.message;
    };
}

