/* Generic error manager.
 * Consume and treats throwable errors.
 *  > catalogs              Array of error catalogs.                            */
function ErrorManager(catalogs) {
    
    if (catalogs !== "object") {
        catalogs = false;
    }
    
    /* Concrete catalogs */
    this.catalogs = null;
    this.getCatalog = function(name) {
        return this.catalogs[name];
    };
    
    /* Display out-of-context error message.
     * PARAMETERS :
     *  > message           Message to display.
     * RETURNS : N/A.                                                           */
    this.ooc = function(message) {
        console.log(
                "MANAGER ERROR :" + 
                "\n" +
                message +
                "\n"
        );
    };
    
    /* Formats error message for console display.
     * PARAMETERS :
     *  > error             Throwable error.
     *  > entry             Corresponding catalog entry.
     *  > critical          Error status (pre-defined).
     * RETURNS : correctly, ready-to-use error message.                         */
    this.format = function(error, entry, critical) {
        var prefix = "";
        var message = "";
        var params = "";
        
        prefix += Toolkit.formatDate(new Date(), "exacthour");
        prefix += " ";
        prefix += Toolkit.leadingChars(error.getCode(), 5, " ");
        prefix += " ";
        
        if (critical) {
            message += "CRITICAL ERROR";
            message += "\n";
            message += Toolkit.repeatedString(" ", prefix.length);
        }
        
        message += $(entry).children("message").text();
        
        $(entry).children("param").each(function() {
            params += "\n";
            params += Toolkit.repeatedString(" ", prefix.length);
            params += " @";
            params += Toolkit.followingChars($(this).attr("id"), 24, " ");
            
            var buff = error.getParams()[$(this).attr("id")];
            if (typeof(buff) === "string") {
                params += buff;
            } else {
                params += "Undefined parameter";
            }
        });
        
        return prefix + message + params;
    };
    
    /* Global error treatment.
     * PARAMETERS :
     *  > error             Throwable error.
     * RETURNS :
     *  True in case of successfull treatment, false else.                      */
    this.treat = function(error) {
        var context = error.getContext();
        var catalog = this.getCatalog(context);
        var code = error.getCode();
        var entry = $(catalog).find('catalog > error[id="' + code + '"]');
        
        if ($(entry).length !== 1) {
            this.ooc("Unable to find error [" + code + "] in context [" + context + "]");
        } else {
            if ($(entry).attr("critical") === "true") {
                this.treatMajor(error, entry);
            } else {
                this.treatMinor(error, entry);
            }
        }
    };
    
    /* Major error treatment.
     * PARAMETERS :
     *  > error             Throwable error.
     *  > entry             Catalog entry.
     * RETURNS :
     *  True in case of successfull treatment, false else.                      */
    this.treatMajor = function(error, entry) {
        // Displaying message
        console.log(this.format(error, entry, true));
        
        // Registering error
        // ...
    };
    
    /* Minor error treatment.
     * PARAMETERS :
     *  > error             Throwable error.
     *  > entry             Catalog entry.
     * RETURNS :
     *  True in case of successfull treatment, false else.                      */
    this.treatMinor = function(error, entry) {
        // Displaying message
        console.log(this.format(error, entry, false));
    };
    
    /* Initializing */
    for (var i = 0; i < catalogs.length; i++) {
        jQuery.ajax({
            type: "GET",
            url: catalogs[i],
            data: null,
            dataType: "xml",
            cache: false,
            async: false,
            timeout: 500
        }).error(function() {
            this.ooc("Unable to load catalog [" + catalogs[i] + "]");
        }).success(function(data) {
            var buff = $(data).find("catalog").attr("name");
            this.catalogs[buff] = data;
        });
    }
}

