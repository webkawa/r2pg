/* Framework component.
 * Independant, semi-auto managed front-office component.
 * PARAMETERS :
 *  > container             Containing node.
 *  > descriptor            URL of description file.
 *  > methods               Array of methods to implement.                      */

function Component(container, descriptor, methods) {
    Toolkit.checkTypeOf("Component", "container", container, "object");
    Toolkit.checkTypeOf("Component", "descriptor", descriptor, "string");
    Toolkit.checkTypeOf("Component", "methods", methods, "array");
    
    /* Container */
    this.container = container;
    this.getContainer = function() {
        return this.container;
    };
    
    /* Descriptor */
    this.descriptor = descriptor;
    this.getDescriptor = function() {
        return this.descriptor;
    };
    
    /* Model */
    this.model = null;
    this.getModelName = function() {
        return $(this.model).find("component").attr("name");
    };
    
    /* Methods */
    this.methods = [];
    this.isMethod = function(name) {
        for (var i = 0; i < this.methods.length; i++) {
            if (this.methods[i].getName() === name) {
                return true;
            }
        }
        return false;
    };
    this.getMethod = function(name) {
        for (var i = 0; i < this.length; i++) {
            if (this.methods[i].getName() === name) {
                return this.methods[i];
            }
        }
        var p = {
            component: this.getModelName(),
            name: name
        };
        throw new Error("cpn", 2, p);
    };
    this.saveMethod = function(method) {
        
    };
    
    /* Selectors */
    this.selectors = [];
    this.isSelector = function(name) {
        for (var i = 0; i < this.selectors.length; i++) {
            if (this.selectors[i].getName() === name && this.selectors[i].isActive()) {
                return true;
            }
        }
        return false;
    };
    this.getSelector = function(name) {
        var cfg_ais = CFG.get("components", "allow.inactive.selectors");
        for (var i = 0; i < this.selectors.length; i++) {
            if (this.selectors[i].getName() === name) {
                if (this.selectors[i].isActive() || cfg_ais) {
                    return this.selectors[i];
                } else {
                    var p = {
                        name: name,
                        path: this.selectors[i].getPath()
                    };
                    throw new Error("cpn", 5, p);
                }
            }
        }
        var p = {
            name: name
        };
        throw new Error("cpn", 6, p);
    };
    
    /* Initialize */
    
    for (var i = 0; i < methods.length; i++) {
        if (methods[i] instanceof Method) {
            this.methods[this.methods.length] = methods[i];
        } else {
            var p = {
                component: this.getModelName(),
                item: methods[i]
            };
            throw new Error("cpn", 3, p);
        }
    }
    
    jQuery.ajax({
        type: "GET",
        url: this.descriptor,
        data: null,
        dataType: "xml",
        cache: false,
        async: false,
        timeout: 500
    }).error(function(jqXHR, status, info) {
        var p = {
            url: this.url,
            info: info
        };
        throw new Error("cpn", 4, p);
    }).success(function(data) {
        this.model = data;
    });
};