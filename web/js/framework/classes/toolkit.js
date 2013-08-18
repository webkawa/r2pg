/* Framework general interest tools.
 * Toolkit is a pseudo-class, offering only static methods, with no error-based
 * parameters check.                                                            */
var Toolkit = { 
    
    /* Generates repeated string.
     * PARAMETERS : 
     *  > value         Value to repeat.
     *  > size          Number of iterations.
     * RETURBS : repeated string.                                               */
    repeatedString: function(size, value) {
        var result = "";
        for (var i = 0; i < size; i++) {
            result += value;
        }
        return result;
    },
    
    /* Adds leading chars to a string.
     * PARAMETERS :
     *  > value         Base value.
     *  > fulllength    Full length of value with leading chars.
     *  > char          Leading char.
     * RETURNS : 
     *  Value with leading chars.                                               */
    leadingChars: function(value, fulllength, char) {
        var valuelength = value.toString().length;
        var result = '';
        for (var i = 0; i < fulllength - valuelength; i++) {
            result += char;
        }
        result += value;
        return result;
    },
    
    /* Adds following chars to a string.
     * PARAMETERS :
     *  > value         Base value.
     *  > fulllength    Full length of value with following chars.
     *  > char          Following char.
     * RETURNS :
     *  Value with following chars.                                             */
    followingChars: function(value, fulllength, char) {
        var valuelength = value.toString().length;
        var result = value;
        for (var i = 0; i < fulllength - valuelength; i++) {
            result += char;
        }
        return result;
    },
    
    /* Shorten a string at selected size.
     * PARAMETERS :
     *  > base                      Base string.
     *  > length                    String length.
     * RETURNS :
     *  Shortened string.                                                       */
    shorten: function(base, length){
        return base.substr(0, length) + (base.length > length ? '...' : '');
    },
            
    /* Cut a string at the selected size.
     * PARAMETERS :
     *  > value                     Base value.
     *  > size                      Lines size.
     * RETURNS :
     *  Array of text lines.                                                    */
     cut: function(value, size) {
         var lines = [];
         var sum = 0;
         var p = 0;
         
         p = size;
         while (p < value.length) {
             while (value.charAt(p) !== " " && value.charAt(p) !== "\n" && p > sum) {
                 p--;
             }
             if (p === sum) {
                 p = sum + size;
             }
             lines[lines.length] = value.substr(sum, p - sum);
             sum = p + 1;
             p = Math.min(sum + size, value.length);
         }
         lines[lines.length] = value.substr(sum);
         
         return lines;
     },
    
    /* Converts and returns a date to an appropriate string format.
     * PARAMETERS:
     *  > date          Date to convert.
     *  > format        Expected format (allows : exacthour, en - default).
     * RETURNS : 
     *  Correctly formated date.                                                */
    formatDate: function(date, format) {
        if (Toolkit.isNull(format)) {
            format = 'en';
        }
        if (format === "exacthour") {
            return this.leadingChars(date.getHours(), 2, '0') +
                   ':' +
                   this.leadingChars(date.getMinutes(), 2, '0') +
                   ':' +
                   this.leadingChars(date.getSeconds(), 2, '0') +
                   '.' +
                   this.followingChars(date.getMilliseconds(), 3, '0');
        }
        if (format === 'en') {
            return date.getFullYear() +
                   '.' +
                   this.leadingChars(date.getMonth() + 1, 2, '0') +
                   '.' +
                   this.leadingChars(date.getDate(), 2, '0') +
                   ' ' +
                   this.leadingChars(date.getHours(), 2, '0') +
                   ':' +
                   this.leadingChars(date.getMinutes(), 2, '0') +
                   ':' +
                   this.leadingChars(date.getSeconds(), 2, '0') +
                   '.' +
                   this.followingChars(date.getMilliseconds(), 3, '0');
        }
    },
    
    /* Checks if a variable is correctly initialized with a pre-assigned format
     * and throws an error if necessary.
     * PARAMETERS :
     *  > object        Object name.
     *  > name          Variable name.
     *  > value         Variable value.
     *  > type          Expected JS type as result of typeof() function.
     * RETURNS : N/A                                                            */
    checkTypeOf: function(object, name, value, type) {
        var rtype = typeof(value);
        if (rtype === "undefined" || rtype !== type) {
            var p = {
                object: object,
                name: name,
                value: value,
                type: type,
                rtype: rtype
            };
            throw new Error("core", 5, p);
        }
    },
    
    /* Checks if a variable is correctly initialized with a pre-assigned class
     * and throws an error if necessary.
     * PARAMETERS :
     *  > object        Object name.
     *  > name          Variable name.
     *  > value         Variable value.
     *  > proto         Class prototype.                                        
     * RETURNS : N/A                                                            */
    checkClassOf: function(object, name, value, proto) {
        if (!(value instanceof proto)) {
            var p = {
                object: object,
                name: name,
                value: value,
                proto: proto
            };
            throw new Error("core", 6, p);
        }
    },
    
    /* Checks if a variable is undefined.
     * PARAMETERS :
     *  > value         Checked value.
     * RETURNS :
     *  true if value is undefined, false else.                                 */
     isNull: function(value) {
        return typeof(value) === "undefined";
     }
};