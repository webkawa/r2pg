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
        // Base security
        if (!(error instanceof Error)) {
            ErrorManager.process(new Error("core", 2, {message: error.message}));
        }
        
        // While security
        if (error.getCauseLength() > 10) {
            throw "Error manager interruption. Please check error ID 1@core is defined";
        }
        
        // Collecting informations
        var context = error.getContext();
        var catalog = ErrorManager.getCatalog(context);
        if (typeof(catalog) === "undefined") {
            var p = {
                cause: "Unable to find catalog",
                id: error.getCode(),
                context: error.getContext()
            };
            ErrorManager.process(new Error("core", 1, p));
        }
        var entry = $(catalog).find('catalog > error[id="' + error.getCode() + '"]');
        if ($(entry).length !== 1) {
            var p = {
                cause: "Unable to find unique error",
                id: error.getCode(),
                context: error.getContext()
            };
            ErrorManager.process(new Error("core", 1, p));
        }
        var critical = $(entry).attr("critical");
        
        // Processing error
        critical === "true" ?
            ErrorManager.processMajor(error, entry) : 
            ErrorManager.processMinor(error, entry);
    },
    
    /* Minor error processing.
     * PARAMETERS :
     *  > error                 Throwable error.
     *  > entry                 Catalog entry.
     * RETURNS : N/A                                                            */
     processMinor: function(error, entry) {
        console.log(ErrorManager.stack(error, entry, false));
     },
             
    /* Minor error processing.
     * PARAMETERS :
     *  > error                 Throwable error.
     *  > entry                 Catalog entry.
     * RETURNS : N/A                                                            */
     processMajor: function(error, entry) {
        console.log(ErrorManager.stack(error, entry, true));
     },      
    
    /* Prepares and returns an error message for console display.
     * PARAMETERS :
     *  > error                 Throwed error.
     *  > entry                 Catalog entry.
     *  > critical              Critical status.
     * RETURNS :
     *  Error message ready for display.                                        */
    stack: function(error, entry, critical) {
        var prefix = "";
        var message = "";
        var params = "";
        var causes = "";
        var causeprefix = "";
        var causemessage = "";
        var causeparams = "";
        var causecatalog, causeentry;
        var parent = null;
        
        // Prefix
        prefix += Toolkit.formatDate(new Date(), "exacthour");
        prefix += " ";
        prefix += error.getId();
        prefix += " ";
        
        // Message
        critical ? 
            message += "Critical error" : message += "Standard error";
        message += "\n";
        message += Toolkit.repeatedString(prefix.length, " ");
        message += $(entry).children("message").text();
        
        // Params
        $(entry).children("param").each(function() {
            params += "\n";
            params += Toolkit.repeatedString(prefix.length, " ");
            params += " > ";
            params += Toolkit.followingChars($(this).text(), 24, ".");
            if (typeof(error.getParams()[$(this).attr("id")]) !== "undefined") {
                params += error.getParams()[$(this).attr("id")];
            } else {
                params += "?";
            }
        });
        
        // Causes
        parent = error.getCause();
        while (parent instanceof Error) {
            causes += "\n";
            
            // Cause prefix
            causeprefix = Toolkit.leadingChars("Cause : " + parent.getId() + " ", prefix.length, " ");
            
            // Cause message
            causecatalog = ErrorManager.getCatalog(parent.getContext());
            if (typeof(causecatalog) !== "undefined") {
                causeentry = $(causecatalog).find('catalog > error[id="' + parent.getCode() + '"]');
            }
             
            if (typeof(causecatalog) === "undefined" || $(causeentry).length !== 1) {
                causemessage = "Unknow cause error";
            } else {
                causemessage = $(causeentry).children("message").text();
            }
            
            // Cause parameters
            $(causeentry).children("param").each(function() {
                causeparams  = "\n";
                causeparams += Toolkit.repeatedString(prefix.length, " ");
                causeparams += " > ";
                causeparams += Toolkit.followingChars($(this).text(), 24, ".");
                if (typeof(parent.getParams()[$(this).attr("id")]) !== "undefined") {
                    causeparams += parent.getParams()[$(this).attr("id")];
                } else {
                    causeparams += "?";
                }
            });
            
            // Complete causes
            causes += causeprefix + causemessage + causeparams;
            
            // Cause increase
            parent = parent.getCause();
        }
        
        // Return
        return "\n" + prefix + message + params + causes;
    }
};