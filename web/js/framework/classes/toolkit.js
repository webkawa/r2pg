/* Framework general interest tools.
 * Toolkit is a pseudo-class, offering only static methods, with no error-based
 * parameters check.                                                            */
var Toolkit = { 
    
    /* Generates repeated string.
     * PARAMETERS : 
     *  > value         Value to repeat.
     *  > size          Number of iterations.
     * RETURBS : repeated string.                                               */
    repeatedString : function(size, value) {
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
    leadingChars : function(value, fulllength, char) {
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
    followingChars : function(value, fulllength, char) {
        var valuelength = value.toString().length;
        var result = value;
        for (var i = 0; i < fulllength - valuelength; i++) {
            result += char;
        }
        return result;
    },
    
    /* Converts and returns a date to an appropriate string format.
     * PARAMETERS:
     *  > date          Date to convert.
     *  > format        Expected format (allows : exacthour, en - default).
     * RETURNS : 
     *  Correctly formated date.                                                */
    formatDate : function(date, format) {
        if (typeof(format) === "undefined") {
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
    }
    
};