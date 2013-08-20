/* Framework component datasource.
 * Manages loading, update and exploitation of an XML data source.
 * PARAMETERS :
 *  > owner             Owning component.
 *  > name              Data source name.
 *  > service           Service URL.                                            
 *  > callbacks         Callbacks as array.                                     */

function Source(name, service, callbacks) {
    Toolkit.checkTypeOf("Source", "name", name, "string");
    Toolkit.checkTypeOf("Source", "service", service, "string");
    if (!Toolkit.isNull(callbacks)) {
        Toolkit.checkTypeOf("Source", "callbacks", callbacks, "object");
    }
    
    /* Owner */
    this.owner;
    this.getOwner = function() {
        return this.owner;
    };
    this.setOwner = function(owner) {
        Toolkit.checkTypeOf("Source.setOwner()", "owner", owner, "object");
        Toolkit.checkClassOf("Source.setOwner()", "owner", owner, Component);
        
        this.owner = owner;
    };
    
    /* Name */
    this.name = name;
    this.getName = function() {
        return this.name;
    };
    
    /* Service */
    this.service = service;
    this.getService = function() {
        return this.service;
    };
    
    /* Data */
    this.data;
    this.getData = function() {
        if (Toolkit.isNull(this.data)) {
            var p = {
                source: this.name,
                component: this.owner.getID()
            };
            throw new Error("cpn", 26, p);
        }
        return this.data;
    };
    
    /*
     *  Callbacks.
     */
    this.callbacks = callbacks;
    this.getCallbacks = function() {
        return this.callbacks;
    };
    
    /* Data selector.
     * PARAMETERS :
     *  > selector          Selector.
     * RETURNS : N/A                                                            */
    this.select = function(selector) {
        return $(this.data).find(selector);
    };
    
    /* Data loader.
     * Executes an asynchronious AJAX call to the data service, memorize XML
     * result, and execute callbacks.
     * PARAMETERS :
     *  > params            Service parameters.
     * RETURNS : N/A                                                            */
    this.load = function(params) {
        var error;
        var errorlength;
        var buff;
        var method;
        var ctx = this;
        
        this.getOwner().log("Accessing data at URL " + ctx.getService());
        jQuery.ajax({
            context: ctx,
            type: "POST",
            url: ctx.getService(),
            data: params,
            dataType: "xml",
            cache: false,
            async: true,
            timeout: 5000
        }).error(function(jqXHR, status, info) {
            var p = {
                url: this.service,
                info: info
            };
            ErrorManager.process(new Error("cpn", 18, p));
        }).success(function(data) {
            try {
                // Copying data
                this.data = data;

                // Checking for native error
                errorlength = $(this.data).find("data > error").length;
                for (var i = 0; i < errorlength; i++) {
                    var id = $(this.data).find("data > error:eq(" + (errorlength - i - 1) + ")").attr("id");
                    var p = {};
                    $(this.data).find("data > error:eq(" + (errorlength - i - 1) + ") > parameter").each(function() {
                        p[$(this).attr("name")] = $(this).text();
                    });
                    error = new Error("wf", parseInt(id), p, error);
                }
                if ($(this.data).find("data > error").length > 0) {
                    p = {
                        component: ctx.getContext().getID(),
                        source: ctx.getName()
                    };
                    throw new Error("cpn", 20, p, error);
                }

                // Linking 
                buff = $(this.data).find("data:first");
                $(this.data).find("model").each(function() {
                    // Selecting set
                    buff = $(buff).children("s");

                    // Linking set
                    $(buff).attr("class", $(this).attr("alias").toLowerCase());

                    // Linking items
                    $(this).children("column").each(function(position) {
                        $(buff).find("s > i:eq(" + position + ")").attr("class", $(this).attr("alias").toLowerCase());
                    });
                });

                // Executes callbacks.
                for (var i = 0; i < this.callbacks.length; i++) {
                    method = this.getOwner().getMethod(this.callbacks[i]);
                    method.call.apply(method, [])
                }

                return;
            } catch (e) {
                ErrorManager.process(e);
            }
        });
    };
};