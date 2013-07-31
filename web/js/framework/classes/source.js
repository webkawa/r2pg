/* Framework component datasource.
 * Manages loading, update and exploitation of an XML data source.
 * PARAMETERS :
 *  name                        Data source name.
 *  url                         Data source URL.
 *  params                      Data source parameters as object.               */

function Source(name, callback, url, params) {
    Toolkit.checkTypeOf("Source", "name", name, "string");
    Toolkit.checkTypeOf("Source", "callback", callback, "string");
    Toolkit.checkTypeOf("Source", "url", url, "string");
    if (typeof(params) !== "undefined") {
        Toolkit.checkTypeOf("Source", "params", params, "object");
    } else {
        params = {};
    }
    
    /* Name */
    this.name = name;
    this.getName = function() {
        return this.name;
    };
    
    /* Callback */
    this.callback = callback;
    this.getCallback = function() {
        return this.callback;
    };
    
    /* URL */
    this.url = url;
    this.getUrl = function() {
        return this.url;
    };
    
    /* Parameters */
    this.params = params;
    this.getParams = function() {
        return this.params;
    };
    this.setParams = function(object) {
        Toolkit.checkTypeOf("Source", "params", params, "Object");
        
        this.params = object;
    };
    
    /* Data */
    this.data;
    this.getData = function() {
        return this.data;
    };
    
    /* Waiter */
    this.waiter;
    this.getWaiter = function() {
        return this.waiter;
    };
    
    /* Context */
    this.context = null;
    this.getContext = function() {
        return this.context;
    };
    this.setContext = function(context) {
        Toolkit.checkTypeOf("Source.setContext", "context", context, "object");
        Toolkit.checkClassOf("Source.setContext", "context", context, Component);
        
        this.context = context;
        if (this.getContext().getModelWaiter() !== "") {
            this.waiter = this.getContext().getModelWaiter();
        }
    };
    
    /* ID-based set getter.
     * PARAMETERS :
     *  id                  Set ID.
     * RETURNS :
     *  Set collection.                                                         */
    this.getSetByID = function(id) {
        return $(this.data).find('s[map="' + id + '"]');
    };
    
    /* Alias-based set getter.
     * PARAMETERS :
     *  alias               Set alias.
     * RETURNS :
     *  Set collection.                                                         */
    this.getSetByAlias = function(alias) {
        return this.getSetByID($(this.data).find('model[alias="' + alias + '"]').attr("id"));
    };
    
    /* Key-based set getter.
     * PARAMETERS :
     *  alias               Set alias.
     *  keys                Set keys as array.
     * RETURNS :
     *  Single set.                                                             */
    this.getSetByKey = function(alias, keys) {
        Toolkit.checkTypeOf("Source.getSetByKey", "keys", keys, "array");
        
        var base = this.getSetByAlias(alias);
        $(this.data).find('model[alias="' + alias + '"] > column:contains("key")').each(function(position) {
            base = $(base).filter(':has(i[map="' + $(this).attr("id") + '"]:contains("' + keys[position] + '")');
        });
        
        return base;
    };
    
    /* ID-based item getter.
     * PARAMETERS :
     *  id                  Item ID.
     * RETURNS :
     *  Item collection.                                                        */
    this.getItemByID = function(id) {
        return $(this.data).find('i[map="' + id + '"]');
    };
    
    /* Alias-based item getter.
     * PARAMETERS :
     *  alias               Item alias.
     * RETURNS :
     *  Item collection.                                                        */
    this.getItemByAlias = function(alias) 
    {
        return this.getItemByID($(this.data).find('model > column[alias="' + alias + '"]').attr("id"));
    };
    
    /* Data load manager.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    this.access = function() {
        var state;
        var status = this.getContext().getStatus();
        var ctx = this;
        
        // Checking current status
        if (status === 3) {
            var p = {
                component: this.getContext().getID(),
                source: this.getName()
            };
            throw new Error("cpn", 22, p);
        };
        
        // Switching to waiter
        if (typeof(this.waiter) !== "undefined" && status === 0) {
            state = this.getContext().getState();
            this.getContext().go(this.waiter);
        }
        
        // Proceding
        $(this.getContext().getContainer()).find("*").promise().done(function() {
            ctx.getContext().log("Accessing data at URL " + ctx.getUrl());
            jQuery.ajax({
                context: ctx,
                type: "POST",
                url: ctx.getUrl(),
                data: this.params,
                dataType: "xml",
                cache: false,
                async: typeof(this.waiter) !== "undefined",
                timeout: 500
            }).error(function(jqXHR, status, info) {
                var p = {
                    url: this.url,
                    info: info
                };
                throw new Error("cpn", 18, p);
            }).success(function(data) {
                try {
                    // Copying data
                    this.data = data;

                    // Launching return animation
                    if (typeof(state) !== "undefined") {
                        this.getContext().go(state);
                    }

                    // Checking for native error
                    $(this.data).find("data > error").each(function() {
                        var id = $(this).attr("id");
                        var p = {};
                        $(this).children("parameter").each(function() {
                            p[$(this).attr("name")] = $(this).text();
                        });
                        var e = new Error("wf", parseInt(id), p);

                        p = {
                            component: ctx.getContext().getID(),
                            source: ctx.getName()
                        };
                        throw new Error("cpn", 20, p, e);
                    });

                    // Linking 
                    var id = 1;
                    var buff = $(this.data).find("data:first");
                    $(this.data).find("model").each(function() {
                        // Selecting set
                        buff = $(buff).children("s");

                        // Linking set
                        $(this).attr("id", id);
                        $(buff).attr("map", id);
                        id++;

                        // Linking items
                        $(this).children("column").each(function(position) {
                            $(this).attr("id", id);
                            $(buff).find("s > i:eq(" + position + ")").attr("map", id);
                            id++;
                        });
                    });

                    // Executing callback
                    this.getContext().getMethod(this.callback).call();
                    
                    return;
                } catch (e) {
                    ErrorManager.process(e);
                }
            });
        });
    };
};