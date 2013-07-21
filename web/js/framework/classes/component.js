/* Framework component.
 * Independant, semi-auto managed front-office component.
 * PARAMETERS :
 *  > container             Containing node.
 *  > descriptor            URL of description file.
 *  > methods               Array of methods to implement.                      */

function Component(container, descriptor, methods) {
    Toolkit.checkTypeOf("Component", "container", container, "object");
    Toolkit.checkClassOf("Component", "container", container, jQuery);
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
            component: this.getID(),
            name: name
        };
        throw new Error("cpn", 2, p);
    };
    this.saveMethod = function(method) {
        for (var i = 0; i < this.methods.length; i++) {
            if (this.methods[i].getName() === method.getName()) {
                if (this.methods[i].isRewritable()) {
                    this.methods[i] = method;
                    return;
                } else {
                    var p = {
                        component: this.getID(),
                        name: method.getName()
                    };
                    throw new Error("cpn", 7, p);
                }
            }
        }
        this.methods[this.methods.length] = method;
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
    this.getSelector = function(name, refresh) {
        var cfg_ais = CFG.get("components", "allow.inactive.selectors");
        for (var i = 0; i < this.selectors.length; i++) {
            if (this.selectors[i].getName() === name) {
                if (this.selectors[i].isActive() || cfg_ais) {
                    if (refresh) {
                        this.selectors[i].refresh();
                    }
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
    
    /* Current state */
    this.state = null;
    this.getState = function() {
        return this.state;
    };
    this.setState = function(state) {
        if ($(this.data).find('state[id="' + state + '"]')) {
            this.state = state;
        } else {
            var p = {
                component: this.getID(),
                state: state
            };
            throw new Error("cpn", 9, p);
        }
    };
    
    /* Generates and returns an unique ID for the component based on the index.
     * PARAMETERS : N/A
     * RETURNS :
     *  Component unique ID.                                                    */
    this.getID = function() {
        /* TODO */
        return 'MyID';
    };
    this.getLogID = function() {
        // TODO
        return "MyID";
    };
    
    /* DOM re-writer.
     * Empties and re-writes container DOM.
     * PARAMETERS :
     *  data                    DOM data.
     * RETURN : N/A                                                             */
    this.rewrite = function(data) {
        $(this.container).empty();
        $(this.container).append(data);
    }
    
    /* Triggers refresher.
     * Unbind, then re-bind all triggers for the selected state.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    this.retrigger = function() {
        var nodes = $([]);
        var ctx = this;
        var targets;
        var bind;
        
        $(this.container).find().unbind();
        
        $(nodes).add($(this.data).find('component > trigger'));
        $(nodes).add($(this.data).find('component > state[id="' + this.state + '"] > trigger'));
        
        $(nodes).each(function() {
            // Parsing
            targets = $([]);
            $(this).children("target").each(function() {
                $(targets).add(ctx.getSelector($(this).text(), $(this).attr("refresh") === "true").getNodes());
            });
            bind = $(this).attr("bind");
            
            // Binding
            $(targets).bind(bind, ctx.call($(this).children("call")));
        });
    };
    
    /* Selector refresher.
     * Checks all selectors for activation/desactivation.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    this.reselect = function() {
        var buff;
        for (var i = 0; i < this.selectors.length; i++) {
            buff = this.selectors[i];
            if (buff.getState() === this.state || typeof(buff.getState()) === "undefined") {
                buff.on();
            } else {
                buff.off();
            }
        }
    };
    
    /* Call a pre-saved animation.
     * PARAMETERS :
     *  node                    Method node.
     * RETURN :
     *  Method result.                                                          */
    this.call = function(node) {
        var name = $(node).children("name").text();
        var params = [];
        $(node).children("parameter").each(function() {
            params[params.length] = $(this).text();
        });
        
        try {
            return this.getMethod(name).call(this, params);
        } catch (e) {
            var p = {
                component: this.getID(),
                name: name
            };
            throw new Error("cpn", 12, p, e);
        }
    };
    
    /* Executes a pre-saved animation.
     * PARAMETERS :
     *  animation               Descripting animation node.
     *  targets                 Targets list.
     *  postback.methods        Postback methods nodes as list.
     *  postback.sequences      Postback sequences nodes as list.
     * RETURNS : N/A                                                            */
    this.animate = function(animation, targets, postback) {
        var from = [];
        var to = [];
        var b1, b2;
        
        // Initialization
        $(animation).children("move").each(function() {
            b1 = $(this).children("property").text();
            
            b2 = $(this).children("from");
            if (b2.length > 0) {
                from[b1] = $(b2).text();
            }
            
            to[b1] = $(this).children("to").text();
        });
        
        // Setup
        $(targets).css(from);
        
        // Execution
        var ctx = this;
        $(targets).animate(to, {
            duration: $(animation).children("speed").text(),
            easing: $(animation).children("easing").text(),
            fail: function() {
                throw new Error("cpn", 13);
            }, done: function() {
                // Standard postbacks
                $(postback.methods).each(function() {
                    ctx.call(this);
                });
                $(postback.sequences).each(function() {
                    ctx.execute(this);
                });
            }
        });
    };
    
    /* Executes a pre-saved sequence.
     * PARAMETERS :
     *  sequence                Descripting sequence node.
     * RETURNS : N/A                                                            */
    this.execute = function(sequence) {
        Log.print(this, "Executes sequence");
        
        // Use vars
        var targets = $([]);
        var animation;
        var postback = {
            method: $([]),
            sequence: $([])
        };
        var buff;
        
        // Executing pre-call
        buff = $(sequence).children("precall");
        if (buff.length > 0) {
            this.call(buff);
        }
        
        // Loading targets
        var ctx = this;
        $(sequence).children("target").each(function() {
            try {
                buff = this.getSelector($(this).text(), $(this).attr("refresh") === "true");
                $(targets).add(buff.getNodes());
            } catch (e) {
                var p = {
                    component: ctx.getID(),
                    target: $(this).text()
                };
                throw new Error("cpn", 11, p, e);
            }
        });
        
        // Loading animation, postback and queue
        animation = $(sequence).find("animation");
        postback.methods = $(sequence).find("postcall");
        postback.sequences = $(sequence).find("queue");
        
        // Launching
        this.animate(animation, targets, postback);
    };
    
    /* Starts component to initial state.
     * PARAMETERS : N/A
     * RETURNS :
     *  True if starting was successfull, false else.                           */
    this.start = function() {
        Log.print(this, "Starting component");
        if (typeof(this.state) !== "undefined") {
            if (CFG.get("components", "allow.invalid.start")) {
                return false;
            } else {
                var p = {
                    component: this.getID()
                };
                throw new Error("cpn", 10, p);
            }
        } else {
            // Writing initial DOM
            this.rewrite($(this.data).find("component > loader > dom").text());
            
            // Launching start actions
            var ctx = this;
            $(this.data).find("component > loader > action").each(function() {
                ctx.execute(this);
            });
            
            // Migrating to initial state
            this.go($(this.data).find("component > loader > to").text());
        }
    };
    
    /* Manages transition from current state to another state.
     * PARAMETERS :
     *  to                      Destination state.
     * RETURN : N/A                                                             */
    this.go = function(to) {
        var ctx = this;
        var node_origin = $(this.data).find('component > state[id="' + this.state + "']");
        var node_dest   = $(this.data).find('component > state[id="' + to + '"]');
        var seq_exit;
        var seq_entry;
        
        try {
            // Checking destination
            if ($(node_dest).length !== 1) {
                var p = {
                    destination: to
                };
                throw new Error("cpn", 15, p);
            }
            
            // Loading exit/entry sequences
            if ($(node_origin).children('out[to="' + to + '"]').length === 1) {
                seq_exit = $(node_origin).children('out[to="' + to + '"]');
            } else {
                if ($(node_origin).children('out:not([to])').length === 1) {
                    seq_exit = $(node_origin).children('out:not([to])');
                }
            }
            if ($(node_dest).children('in[from="' + this.state + '"]').length === 1) {
                seq_entry = $(node_dest).children('in[from="' + this.state + '"]');
            } else {
                if ($(node_dest).children('in:not([from])').length === 1) {
                    seq_entry = $(node_dest).children('in:not([from])');
                }
            }
            
            // Unloading triggers
            $(this.container).find().unbind();
            
            // Executing exit sequence
            if (typeof(seq_exit) !== "undefined") {
                this.execute(seq_exit);
            }
            $(this.container).find().promise("fx", function() {     
                // Switching state
                ctx.setState(to);
                    
                // Executing entry sequence
                if (typeof(seq_entry) !== "undefined") {
                    ctx.execute(seq_entry);
                }
                $(this.container).find().promise("fx", function() {    
                    // Revalidating selectors
                    ctx.reselect();
                    
                    // Reloading triggers
                    ctx.retrigger();
                });
            });
        } catch (e) {
            var p = {
                component: this.getID()
            };
            throw new Error("cpn", 14, p, e);
        }
    };
        
    /* Initialize */
    Log.print(this, "Initializing new component\n---------------------------");
    Log.print(this, "Loading descriptor");
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
    
    Log.print(this, "Referencing methods");
    for (var i = 0; i < methods.length; i++) {
        if (methods[i] instanceof Method) {
            this.saveMethod(methods[i]);
        } else {
            var p = {
                component: this.getID(),
                item: methods[i]
            };
            throw new Error("cpn", 3, p);
        }
    }
    
    Log.print(this, "Loading selectors");
    var ctx = this;
    $(this.data).find("selector").each(function() {
        var buff;
        if (this.isSelector($(this).attr("id"))) {
            var p = {
                name: $(this).attr("id")
            };
            throw new Error("cpn", 8, p);
        } else {
            buff = new Selector(
                ctx, 
                $(this).attr("id"),
                $(this).text(),
                $(this).parents("state").attr("id")
            );
            this.selectors[this.selectors.length] = buff;
        }
    });
    
    Log.print(this, "Reselect/retrigger");
    this.reselect();
    this.retrigger();
};