/* Framework error manager tool.
 * ErrorManager is a pseudo-class, offering only static methods, with no 
 * error-based parameters check.                                                */
var ErrorManager = {
    
    /* Catalog list */
    catalogs: {},
    getCatalog: function(name) {
        return ErrorManager.catalogs[name];
    },
            
    /* Catalog adding function.
     * PARAMETERS :
     *  > url           Catalog URL.
     * RETURNS : 
     *  Catalog name.                                                           */
    addCatalog: function(url) {
        var name;
        jQuery.ajax({
            type: "GET",
            url: url,
            data: null,
            dataType: "xml",
            cache: false,
            async: false,
            timeout: 500
        }).error(function(jqXHR, status, info) {
            var p = {
                url: url,
                info: info
            };
            throw new Error("core", 3, p);
        }).success(function(data) {
            name = $(data).find("catalog").attr("name");
            ErrorManager.catalogs[name] = data;
        });
        return name;
    },
    
    /* Main error processing.
     * PARAMETERS :
     *  > error             Throwable error.
     * RETURNS : N/A                                                            */
    process: function(error) {
        var display = true; 

        // Native errors check
        if (!(error instanceof Error)) {
            var p = {
                name: error.name,
                message: error.message
            };
            var e = new Error("core", 2, p);
            e.setStack(error);
            ErrorManager.process(e);
            display = false;
        } else {
            // While check
            if (error.getCauseLength() > 10) {
                throw "Error manager interruption. Please check error ID 1@core is defined";
            }

            // Collecting informations
            var context = error.getContext();
            var catalog = ErrorManager.getCatalog(context);
            if (Toolkit.isNull(catalog)) {
                var p = {
                    cause: "Unable to find catalog",
                    id: error.getCode(),
                    context: error.getContext()
                };
                ErrorManager.process(new Error("core", 1, p));
                display = false;
            }
            var entry = $(catalog).find('catalog > error[code="' + error.getCode() + '"]');
            if ($(entry).length !== 1) {
                var p = {
                    cause: "Unable to find unique error",
                    id: error.getCode(),
                    context: error.getContext()
                };
                ErrorManager.process(new Error("core", 1, p));
                display = false;
            }
            var critical = $(entry).attr("critical");

            // Parameters check
            $(entry).children('param[required="true"]').each(function() {
                if (Toolkit.isNull(error.getParams()[$(this).attr("id")])) {
                    var p = {
                        code: error.getCode(),
                        context: error.getContext(),
                        id: $(this).attr("id"),
                        parameter: $(this).text()
                    };
                    ErrorManager.process(new Error("core", 4, p, error));
                    display = false;
                }
            });

            // Processing error
            if (display) {
                critical === "true" ?
                    ErrorManager.processMajor(error, entry) : 
                    ErrorManager.processMinor(error, entry);
            }
        }
    },
    
    /* Minor error processing.
     * PARAMETERS :
     *  > error                 Throwable error.
     *  > entry                 Catalog entry.
     * RETURNS : N/A                                                            */
     processMinor: function(error, entry) {
         if (CFG.get("errors", "display.minor")) {
            console.log(ErrorManager.stack(error, entry, false)); 
         }
     },
             
    /* Minor error processing.
     * PARAMETERS :
     *  > error                 Throwable error.
     *  > entry                 Catalog entry.
     * RETURNS : N/A                                                            */
     processMajor: function(error, entry) {
        if (CFG.get("errors", "display.major")) {
            console.log(ErrorManager.stack(error, entry, true)); 
        }
       // TODO : AJAX to register
     },      
    
    /* Prepares and returns an error message for console display.
     * PARAMETERS :
     *  > error                 Throwed error.
     *  > entry                 Catalog entry.
     *  > critical              Critical status.
     * RETURNS :
     *  Error message ready for display.                                        */
    stack: function(error, entry, critical) {
        var cfg_mlength = CFG.get("errors", "display.length.messages");
        var cfg_clength = CFG.get("errors", "display.length.causes");
        var cfg_plength = CFG.get("errors", "display.length.params");
        
        var prefix = "";
        var message = "";
        var messagepre = "";
        var params = "";
        var paramspre = "";
        var causes = "";
        var stack = "";
        var causeprefix = "";
        var causemessage = "";
        var causemessagepre = "";
        var causeparams = "";
        var causeparamspre = "";
        var causestack = "";
        var causecatalog, causeentry;
        var parent = null;
        
        // Prefix
        prefix += Toolkit.formatDate(new Date(), "exacthour");
        prefix += " ";
        prefix += error.getID();
        
        // Message
        if (messagepre === "") {
            messagepre = Toolkit.repeatedString(prefix.length, " ");
        }
        critical ? 
            message += "Critical error" : message += "Standard error";
        message += "\n";
        message += messagepre;
        message += Toolkit.cut($(entry).children("message").text(), cfg_mlength).join("\n" + messagepre);
        
        // Params
        $(entry).children("param").each(function() {
            params += "\n";
            params += Toolkit.repeatedString(prefix.length, " ");
            params += " > ";
            params += Toolkit.followingChars($(this).text(), 24, ".");
            if (paramspre === "") {
                paramspre = Toolkit.repeatedString(params.length - 1, " ");
            }
            if (!Toolkit.isNull(error.getParams()[$(this).attr("id")])) {
                params += Toolkit.cut(error.getParam($(this).attr("id")), cfg_plength).join("\n" + paramspre);
            } else {
                params += "?";
            }
        });
        
        // Stack
        stack  = "\n";
        stack += "\n";
        stack += Toolkit.leadingChars("Stack:", prefix.length, " ");
        stack += error.getStack().join('\n' + Toolkit.repeatedString(prefix.length, " "));
        
        // Causes
        parent = error.getCause();
        while (!Toolkit.isNull(parent)) {
            if (!(parent instanceof Error)) {
                var p = {
                    name: parent.name,
                    message: parent.message
                };
                parent = new Error("core", 2, p);
            }
            
            causes += "\n";
            
            // Cause prefix
            causeprefix = "\n";
            causeprefix += Toolkit.repeatedString(prefix.length, " ");
            causeprefix += "Caused by :";
            causeprefix += "\n";
            causeprefix += Toolkit.leadingChars(parent.getID(), prefix.length, " ");
            
            // Cause message
            causecatalog = ErrorManager.getCatalog(parent.getContext());
            if (!Toolkit.isNull(causecatalog)) {
                causeentry = $(causecatalog).find('catalog > error[code="' + parent.getCode() + '"]');
            }
             
            if (causemessagepre === "") {
                causemessagepre = Toolkit.repeatedString(prefix.length, " ");
            }
            if (Toolkit.isNull(causecatalog) || $(causeentry).length !== 1) {
                causemessage = "Unknow cause error";
            } else {
                causemessage = Toolkit.cut($(causeentry).children("message").text(), cfg_clength).join("\n" + causemessagepre);
            }
            
            // Cause parameters
            causeparams = "";
            $(causeentry).children("param").each(function() {
                causeparams += "\n";
                causeparams += Toolkit.repeatedString(prefix.length, " ");
                causeparams += " > ";
                causeparams += Toolkit.followingChars($(this).text(), 24, ".");
                if (causeparamspre === "") {
                    causeparamspre = Toolkit.repeatedString(causeparams.length - 1, " ");
                }
                if (!Toolkit.isNull(parent.getParams()[$(this).attr("id")])) {
                    causeparams += Toolkit.cut(parent.getParam($(this).attr("id")), cfg_plength).join("\n" + causeparamspre);
                } else {
                    causeparams += "?";
                }
            });
            
            // Cause stack
            causestack  = "\n";
            causestack += "\n";
            causestack += Toolkit.leadingChars("Stack:", prefix.length, " ");
            causestack += parent.getStack().join('\n' + Toolkit.repeatedString(prefix.length, " "));
        
            // Complete causes
            causes += causeprefix + causemessage + causeparams + causestack;
            
            // Cause increase
            parent = parent.getCause();
        }
        
        // Return
        return "\n" + prefix + message + params + stack + causes;
    }
};