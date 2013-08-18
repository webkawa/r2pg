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
    this.getModelWaiter = function() {
        return $(this.model).find("component > waiter").text();
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
        Toolkit.checkTypeOf("Component.saveMethod", "method", method, "object");
        Toolkit.checkClassOf("Component.saveMethod", "method", method, Method);
        
        method.setContext(this);
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
        if (Toolkit.isNull(refresh)) {
            refresh = false;
        }
        return this.getSelector(name, refresh).getNodes();
    };
    
    /* Data sources */
    this.sources = [];
    this.isSource = function(name) {
        for (var i = 0; i < this.sources.length; i++) {
            if (this.sources[i].getName() === name) {
                return true;
            }
        }
        return false;
    };
    this.getSource = function(name) {
        for (var i = 0; i < this.sources.length; i++) {
            if (this.sources[i].getName() === name) {
                return this.sources[i];
            }
        }
        var p = {
            component: this.getID(),
            source: name
        };
        throw new Error("cpn", 19, p);
    };
    this.saveSource = function(source) {
        Toolkit.checkTypeOf("Component.saveSource", "source", source, "object");
        Toolkit.checkClassOf("Component.saveSource", "source", source, Source);
        
        if (this.isSource(source.getName())) {
            var p = {
                component: this.getID(),
                name: source.getName()
            };
            throw new Error("cpn", 3, p);
        }
        source.setContext(this);
        this.sources[this.sources.length] = source;
    };
    this.accessSource = function(name, parameters) {
        if (!Toolkit.isNull(parameters)) {
            this.getSource(name).setParams(parameters);
        }
        this.getSource(name).access();
    };
    this.quickSource = function(name) {
        return this.getSource(name).getData();
    };
    
    /* Current state */
    this.state;
    this.getState = function() {
        return this.state;
    };
    this.setState = function(state) {
        if ($(this.model).find('state[id="' + state + '"]').length === 1) {
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
    this.setSwitchClass = function(mode) {
        var o = CFG.get("components", "css.class.out");
        var i = CFG.get("components", "css.class.in");
        
        if (mode === -1) {
            $(this.container).addClass(o);
        } else if (mode === 0) {
            $(this.container).removeClass(i);
        } else {
            $(this.container).removeClass(o);
            $(this.container).addClass(i);
        }
    };
    
    /* Current status 
     *  0 > Ready
     *  1 > Switching out
     *  2 > Switching in
     *  3 > Starting
     *  9 > Cleaned                                                             */
    this.status = 3;
    this.getStatus = function() {
        return this.status;
    };
    this.setStatus = function(status) {
        this.status = status;
    };
    
    /* ID */
    this.id = Register.add(this);
    this.getID = function() {
        return this.id;
    };
    this.getLogID = function() {
        return 'Component ' + this.getModelName() + '#' + this.id;
    };
    
    /* Delayed tasks */
    this.dt = [];
    this.addDelayedTask = function(id) {
        this.dt[this.dt.length] = id;
    };
    this.clearDelayedTasks = function() {
        for (var i = 0; i < this.dt.length; i++) {
            clearTimeout(this.dt[i]);
        }
        this.dt = [];
    };
    
    /* Attributes register.
     * Adds a new attribute to component for specific use.
     * PARAMETERS :
     *  name                    Variable name.
     *  value                   Variable default value.
     * RETURNS : N/A                                                            */
    this.register = function(name, value) {
        this[name] = value;
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
            $(this).children("action").each(function() {
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
            if (buff.getState() === this.state || Toolkit.isNull(buff.getState())) {
                buff.on();
                buff.refresh();
            } else {
                buff.off();
            }
        }
    };
    
    /* Call a pre-saved method.
     * PARAMETERS :
     *  context                     Binding context.
     * RETURN :
     *  Method result or 0 if delayed.                                          */
    this.call = function(context) {
        var name = $(this).attr("call");
        var params = [];
        $(this).children("parameter").each(function() {
            params[params.length] = $(this).text();
        });
        var delay = 0;
        if ($(this).is('[delay]')) {
            delay = parseInt($(this).attr("delay"));
        }
        
        try {
            if (delay === 0) {
                return context.getMethod(name).call(params);
            } else {
                var t = setTimeout(function() {
                    try {
                        context.getMethod(name).call(params);
                    } catch (e) {
                        var p = {
                            component: context.getID(),
                            method: name
                        };
                        ErrorManager.process(new Error("cpn", 23, p, e));
                    }
                }, delay);
                context.addDelayedTask(t);
                
                return 0;
            }
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
        var ctx = this;
        
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
        var params = {
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
        };
        if ($(animation).children("progress").length === 1) {
            params.progress = function() {
                ctx.call.apply($(animation).children("progress"), [ctx]);
            };
        };
        $(targets).animate(to, params);
    };
    
    /* Executes a pre-saved sequence.
     * PARAMETERS :
     *  sequence                Descripting sequence node.
     * RETURNS : N/A                                                            */
    this.execute = function(sequence) {
        var lt;
        if ($(sequence).is("in"))               lt = "in";
        else if ($(sequence).is("out"))         lt = "out";
        else                                    lt = "queue";
        this.log("Executes sequence [" + lt + "]/[" + this.getState() + "]");
        
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
        $(sequence).children("pre").each(function() {
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
        animation = $(sequence).children("animation");
        postback.methods = $(sequence).children("post");
        postback.sequences = $(sequence).children("queue");
        
        // Launching
        this.animate(animation, targets, postback);
    };
    
    /* Starts component to initial state.
     * PARAMETERS : N/A
     * RETURNS :
     *  True if starting was successfull, false else.                           */
    this.start = function() {
        this.log("Starting component");
        if (!Toolkit.isNull(this.state)) {
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
                ctx.call.apply(this, [ctx]);
            });
            
            // Loading global selectors
            this.reselect();
            
            // Migrating to initial state
            this.setStatus(0);
            this.go($(this.model).find("component > loader > to").text());
        }
    };
    
    /* Manages transition from current state to another state.
     * PARAMETERS :
     *  to                      Destination state.
     *  complement              Complementary callback function.
     * RETURN : N/A                                                             */
    this.go = function(to, complement) {
        if (this.status !== 0) {
            var p = {
                component: this.getID(),
                error: "Component not ready"
            };
            throw new Error("cpn", 15, p);
        }
        if (Toolkit.isNull(this.state) && Toolkit.isNull(to)) {
            var p = {
                component: this.getID(),
                error: "Neither origin or destination defined"
            };
            throw new Error("cpn", 15, p);
        }
        
        // Used variables
        var ctx = this;
        var node_origin;
        var node_dest;
        if (!Toolkit.isNull(this.state)) {
            node_origin = $(this.model).find('component > state[id="' + this.state + '"]');
        }
        if (!Toolkit.isNull(to)) {
            node_dest = $(this.model).find('component > state[id="' + to + '"]');
        }
        var seq_exit;
        var seq_entry;
        var drt = CFG.get("components", "css.class.removal");
        var conclude;
        
        try {
            // Cleaning delayed tasks
            this.clearDelayedTasks();
            
            // Setting classes
            this.setStateClass(this.state, to);
            this.setSwitchClass(-1);
            
            // Loading exit/entry sequences
            if (!Toolkit.isNull(node_origin)) {
                if ($(node_origin).children('out[to="' + to + '"]').length > 0) {
                    seq_exit = $(node_origin).children('out[to="' + to + '"]');
                } else {
                    if ($(node_origin).children('out:not([to])').length > 0) {
                        seq_exit = $(node_origin).children('out:not([to])');
                    }
                }
            }
            if (!Toolkit.isNull(node_dest)) {
                if ($(node_dest).children('in[from="' + this.state + '"]').length > 0) {
                    seq_entry = $(node_dest).children('in[from="' + this.state + '"]');
                } else {
                    if ($(node_dest).children('in:not([from])').length > 0) {
                        seq_entry = $(node_dest).children('in:not([from])');
                    }
                }
            }
            
            // Unloading triggers
            $(this.container).find("*").unbind();
            
            // Executing exit sequence
            this.status = 1;
            if (!Toolkit.isNull(seq_exit)) {
                $(seq_exit).each(function() {
                    ctx.execute(this);
                });
            }
            $(this.container).find("*").promise().done(function() {
                // Executes delayed removal
                $(ctx.getContainer()).find("." + drt).remove();
                
                // Switching state
                ctx.setState(to);
                
                // Setting classes
                ctx.setSwitchClass(1);
                       
                // Revalidating selectors
                ctx.reselect();
                    
                // Executing entry sequence
                ctx.setStatus(2);
                if (!Toolkit.isNull(seq_entry)) {
                    $(seq_entry).each(function() {
                        ctx.execute(this);
                    });
                }
                $(ctx.container).find("*").promise().done(function() {
                    ctx.setStatus(0);
                    if (Toolkit.isNull(to)) {
                        // Closing component
                        ctx.clean();
                    } else {    
                        // Executes delayed removal
                        $(ctx.getContainer()).find("." + drt).remove();
                    
                        // Reloading triggers
                        ctx.retrigger();

                        // Setting classes
                        ctx.setStateClass(ctx.state, to);
                        ctx.setSwitchClass(0);
                        
                        // Executes complementary callback
                        if (!Toolkit.isNull(complement)) {
                            complement.apply(ctx);
                        }
                        
                        // Executes conclusion methods
                        conclude = $();
                        if (!Toolkit.isNull(seq_exit)) {
                            conclude = $(conclude).add($(seq_exit).find("conclude"));
                        }
                        if (!Toolkit.isNull(seq_entry)) {
                            conclude = $(conclude).add($(seq_entry).find("conclude"));
                        }
                        $(conclude).each(function() {
                            ctx.call.apply(this, [ctx]);
                        });
                    }
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
        this.log("Cleaning component");
        
        // Removing DOM
        this.setStateClass();
        $(this.container).removeClass(this.getModelName());
        $(this.container).empty();
        
        // Cleaning references (TO IMPROVE)
        this.methods = [];
        this.selectors = [];
        Register.remove(this.getID());
    };
    
    /* Quick log */
    this.log = function(message, add) {
        Log.print(this, message, add);
    };
        
    /* Initialize */
    this.log("Initializing new component");
    this.log("Loading descriptor");
    jQuery.ajax({
        context: this,
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
    
    this.log("Tagging container");
    $(this.container).addClass("cpn" + this.getModelName());
    
    this.log("Loading selectors");
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
    
    this.log("Saving default methods");
    this.saveMethod(new Method(this.go, "go", false));
    this.saveMethod(new Method(this.accessSource, "access", false));
    this.saveMethod(new Method(this.log, "log", true));
};