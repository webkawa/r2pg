/*  Configuration variable.
 *  Simple, independant configuration variable caracterized by a group, key, level
 *  and type.                                                                   */

function CFGItem(group, key, level, type, value) {
    Toolkit.checkTypeOf("CFGItem", "group", group, "string");
    Toolkit.checkTypeOf("CFGItem", "key", key, "string");
    Toolkit.checkTypeOf("CFGItem", "level", level, "number");
    Toolkit.checkTypeOf("CFGItem", "type", type, "string");
    
    /* Group */
    this.group = group;
    this.getGroup = function() {
        return this.group;
    };
    
    /* Key */
    this.key = key;
    this.getKey = function() {
        return this.key;
    };
    
    /* Level */
    this.level = level;
    this.getLevel = function() {
        return this.level;
    };
    
    /* Type */
    this.type = type;
    this.getType = function() {
        return this.type;
    };
    
    /* Value */
    try {
        if (this.type === "string")         this.value = value;
        else if (this.type === "integer")   this.value = parseInt(value);
        else if (this.type === "float")     this.value = parseFloat(value);
        else if (this.type === "date")      this.value = Date.parse(value);
        else if (this.type === "boolean")   this.value = (value === "true");
    } catch(jse) {
        var p1 = {
            name: jse.name,
            message: jse.message
        };
        var c = new Error("core", 2, p1);
        var p2 = {
            group: this.group,
            key: this.key,
            value: value,
            type: this.type
        };
        throw new Error("cfg", 4, p2, c);
    };
    this.getValue = function() {
        return this.value;
    };
};