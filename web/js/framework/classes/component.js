/* Framework component.
 * Independant, semi-auto managed front-office component.
 * PARAMETERS :
 *  > container             Containing node.
 *  > descriptor            URL of description file.                            */

function Component(container, descriptor) {
    Toolkit.checkTypeOf("Component", "container", container, "object");
    Toolkit.checkClassOf("Component", "container", container, jQuery);
    Toolkit.checkTypeOf("Component", "descriptor", descriptor, "string");
    
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
    this.getModelType = function() {
        return $(this.model).find("component").attr("type");
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
        for (var i = 0; i < this.methods.length; i++) {
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
        if (!(method instanceof Method)) {    
            var p = {
                component: this.getID(),
                item: methods[i]
            };
            throw new Error("cpn", 3, p);
        }
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
            if (this.selectors[i].getName() === name && this.selectors[i].getStatus()) {
                return true;
            }
        }
        return false;
    };
    this.getSelector = function(name, refresh) {
        var cfg_ais = CFG.get("components", "allow.inactive.selectors");
        for (var i = 0; i < this.selectors.length; i++) {
            if (this.selectors[i].getName() === name) {
                if (this.selectors[i].getStatus() || cfg_ais) {
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
    this.quickSelect = function(name, refresh) {
        if (typeof(refresh) === "undefined") {
            refresh = false;
        }
        return this.getSelector(name, refresh).getNodes();
    }
    
    /* Current state */
    this.state;
    this.getState = function() {
        return this.state;
    };
    this.setState = function(state) {
        if ($(this.model).find('state[id="' + state + '"]')) {
            this.state = state;
        } else {
            var p = {
                component: this.getID(),
                state: state
            };
            throw new Error("cpn", 9, p);
        }
    };
    this.setStateClass = function(from, to) {
        var buff;
        var keyfrom = CFG.get("components", "css.prefix.from");
        var keyto = CFG.get("components", "css.prefix.to");
        var keyat = CFG.get("components", "css.prefix.at");
        var tofrom = typeof(from);
        var toto = typeof(to);
        var ctx = this;
        
        // Pre-clean
        $(this.model).find("state").each(function() {
            buff = keyfrom + $(this).attr("id") + " " +
                     keyto + $(this).attr("id") + " " +
                     keyat + $(this).attr("id");
            $(ctx.container).removeClass(buff);
        });
        
        // Adding classes
        if (tofrom === "undefined" && toto === "undefined") {
            return;
        } else if (from === to) {
            $(this.container).addClass(keyat + from);
        } else if (toto === "undefined") {
            $(this.container).addClass(keyfrom + from);
        } else if (tofrom === "undefined") {
            $(this.container).addClass(keyto + to);
        } else {
            $(this.container).addClass(keyfrom + from + " " + keyto + to);
        }
    };
    
    /* ID */
    this.id = Register.add(this);
    this.getID = function() {
        return this.id;
    };
    this.getLogID = function() {
        return 'Component ' + this.getModelName() + '#' + this.id;
    };
    
    /* DOM re-writer.
     * Empties and re-writes container DOM.
     * PARAMETERS :
     *  data                    DOM data.
     * RETURN : N/A                                                             */
    this.rewrite = function(data) {
        $(this.container).empty();
        $(this.container).append(data);
    };
    
    /* Triggers refresher.
     * Unbind, then re-bind all triggers for the selected state.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    this.retrigger = function() {
        var nodes = $([]);
        var ctx = this;
        var targets;
        var bind;
        
        $(this.container).find("*").unbind();
        
        nodes = $(nodes).add($(this.model).find('component > trigger'));
        nodes = $(nodes).add($(this.model).find('component > state[id="' + this.state + '"] > trigger'));

        $(nodes).each(function() {
            // Parsing
            targets = $([]);
            $(this).children("target").each(function() {
                targets = $(targets).add(ctx.getSelector($(this).text(), $(this).attr("refresh") === "true").getNodes());
            });
            bind = $(this).attr("bind");
            
            // Binding
            $(this).children("call").each(function() {
                $(targets).on(bind, $.proxy(ctx.call, this, ctx));
            });
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
                buff.refresh();
            } else {
                buff.off();
            }
        }
    };
    
    /* Call a pre-saved animation.
     * PARAMETERS :
     *  context                     Binding context.
     * RETURN :
     *  Method result.                                                          */
    this.call = function(context) {
        var name = $(this).children("name").text();
        var params = [];
        $(this).children("parameter").each(function() {
            params[params.length] = $(this).text();
        });
        
        try {
            return context.getMethod(name).call(params);
        } catch (e) {
            var p = {
                name: name
            };
            ErrorManager.process(new Error("cpn", 12, p, e));
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
        var from = {};
        var to = {};
        var b1, b2;
        
        // Initialization
        $(animation).children("move").each(function() {
            b1 = $(this).children("property").text();
            
            b2 = $(this).children("from");
            if ($(b2).length > 0) {
                from[b1] = $(b2).text();
            }
            to[b1] = $(this).children("to").text();
        });
        
        // Setup
        $(targets).css(from);
        
        // Execution
        var ctx = this;
        $(targets).animate(to, {
            duration: parseInt($(animation).children("speed").text()),
            easing: $(animation).children("easing").text(),
            fail: function() {
                throw new Error("cpn", 13);
            }, done: function() {
                // Standard postbacks
                $(postback.methods).each(function() {
                    ctx.call.apply(this, [ctx]);
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
        var ctx = this;
        var targets = $([]);
        var animation;
        var postback = {
            method: $([]),
            sequence: $([])
        };
        var buff;
        
        // Executing pre-call
        $(sequence).children("precall").each(function() {
            ctx.call.apply(this, [ctx]);
        });
        
        // Loading targets
        $(sequence).children("target").each(function() {
            try {
                buff = ctx.getSelector($(this).text(), $(this).attr("refresh") === "true");
                targets = $(targets).add(buff.getNodes());
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
            this.rewrite($(this.model).find("component > loader > dom").text());
            
            // Launching start actions
            var ctx = this;
            $(this.model).find("component > loader > action").each(function() {
                ctx.execute(this);
            });
            
            // Loading global selectors
            this.reselect();
            
            // Migrating to initial state
            this.go($(this.model).find("component > loader > to").text());
        }
    };
    
    /* Manages transition from current state to another state.
     * PARAMETERS :
     *  to                      Destination state.
     * RETURN : N/A                                                             */
    this.go = function(to) {
        if (typeof(this.state) === "undefined" && typeof(to) === "undefined") {
            var p = {
                component: this.getID()
            };
            throw new Error("cpn", 15, p);
        }
        
        // Used variables
        var ctx = this;
        var node_origin;
        var node_dest;
        if (typeof(this.state) !== "undefined") {
            node_origin = $(this.model).find('component > state[id="' + this.state + '"]');
        }
        if (typeof(to) !== "undefined") {
            node_dest = $(this.model).find('component > state[id="' + to + '"]');
        }
        var seq_exit;
        var seq_entry;
        
        try {
            // Setting classes
            this.setStateClass(this.state, to);
            
            // Loading exit/entry sequences
            if (typeof(node_origin) !== "undefined") {
                if ($(node_origin).children('out[to="' + to + '"]').length === 1) {
                    seq_exit = $(node_origin).children('out[to="' + to + '"]');
                } else {
                    if ($(node_origin).children('out:not([to])').length === 1) {
                        seq_exit = $(node_origin).children('out:not([to])');
                    }
                }
            }
            if (typeof(node_dest) !== "undefined") {
                if ($(node_dest).children('in[from="' + this.state + '"]').length === 1) {
                    seq_entry = $(node_dest).children('in[from="' + this.state + '"]');
                } else {
                    if ($(node_dest).children('in:not([from])').length === 1) {
                        seq_entry = $(node_dest).children('in:not([from])');
                    }
                }
            }
            
            // Unloading triggers
            $(this.container).find("*").unbind();
            
            // Executing exit sequence
            if (typeof(seq_exit) !== "undefined") {
                this.execute(seq_exit);
            }
            $(this.container).find("*").promise().done(function() {     
                // Switching state
                ctx.setState(to);
                    
                // Executing entry sequence
                if (typeof(seq_entry) !== "undefined") {
                    ctx.execute(seq_entry);
                }
                $(ctx.container).find("*").promise().done(function() {    
                    // Revalidating selectors
                    ctx.reselect();
                    
                    // Reloading triggers
                    ctx.retrigger();
                    
                    // Setting classes
                    ctx.setStateClass(ctx.state, to);
                });
            });
        } catch (e) {
            var p = {
                component: this.getID()
            };
            throw new Error("cpn", 14, p, e);
        }
    };
        
    /* Component de-allocation.
     * PARAMETERS : N/A
     * RETURNS : N/A                                                            */
    this.clean = function() {
        // Removing DOM
        this.setStateClass();
        $(this.container).empty();
        
        // Cleaning references (TO IMPROVE)
        this.methods = [];
        this.selectors = [];
        Register.remove(this.getID());
    };
        
    /* Initialize */
    Log.print(this, "Initializing new component");
    Log.print(this, "Loading descriptor");
    var ajbuff;
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
        ajbuff = data;
    });
    this.model = ajbuff;
    
    Log.print(this, "Loading selectors");
    var ctx = this;
    $(this.model).find("selector").each(function() {
        var buff;
        if (ctx.isSelector($(this).attr("id"))) {
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
            ctx.selectors[ctx.selectors.length] = buff;
        }
    });
    
    Log.print(this, "Saving default methods");
    this.saveMethod(new Method(this.go, "go", this, false));
    this.saveMethod(new Method(this.clean, "clean", this, false));
};