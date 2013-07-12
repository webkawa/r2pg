/* Configuration manager tool.
 * CFG is a pseudo-class, offering only static methods, with no 
 * error-based parameters check.                                                */

var CFG = {
    /* Variables library */
    lib: [],
    
    /* Variable getter.
     * PARAMETERS :
     *  > group             Variable group.
     *  > key               Variable key.
     * RETURN : found variable.                                                 */
    get: function(group, key) {
        var buff;
        for (var i = 0; i < CFG.lib.length; i++) {
            buff = CFG.lib[i];
            if (buff.getGroup() === group && buff.getKey() === key) {
                return buff.getValue();
            }
        }
        var p = {
            group: group,
            key: key
        };
        throw new Error("cfg", 1, p);
    },
    
    /* Single variable add.
     * PARAMETERS :
     *  > variable          Valid variable object.
     * RETURNS :
     *  True if success, false if level too low.                                */
    add: function(variable) {
        var buff;
        for (var i = 0; i < CFG.lib.length; i ++) {
            buff = CFG.lib[i];
            if (buff.getGroup() === variable.getGroup() && buff.getKey() === variable.getKey()) {
                if (buff.getLevel() < variable.getLevel()) {
                    CFG.lib[i] = variable;
                    return true;
                } else {
                    return false;
                }
            }
        }
        CFG.lib[CFG.lib.length] = variable;
        return true;
    },
    
    /* Library loader.
     * PARAMETERS :
     *  > url               Library URL.                                        
     * RETURNS :
     *  Number of variables added.                                              */
    load: function(url) {
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
            throw new Error("cfg", 2, p);
        }).success(function(data) {
            var count = 0;
            var baselevel, group, key, level, type, value, variable;
            
            // Finding base level
            baselevel = parseInt($(data).find("configuration").attr("level"));
            
            // Loading
            $(data).find("configuration > group > *").each(function() {
                // Collects data
                group = $(this).parent("group").attr("id");
                key = $(this).attr("id");
                
                $(this).is("[level]") ?
                    level = $(this).attr("level") :
                    level = baselevel;
            
                type = $(this).prop("tagName").toLowerCase();
                
                value = $(this).text();
                
                // Variable creation
                variable = new CFGItem(group, key, level, type, value);
                
                // Add
                if (CFG.add(variable)) {
                    count++;
                }
            });
            return count;
        });
    }
};