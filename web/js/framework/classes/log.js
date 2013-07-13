/* Logger tool.
 * Log is a pseudo-class, offering only static methods, with no
 * error-based parameters check.                                                */

var Log = {
    /* Writers */
    writers: [],
    
    /* Last writer */
    lastw: null,
    
    /* Direct printer.
     * PARAMETERS :
     *  > author                Author entity.
     *  > message               Text message.
     *  > directout             Complementary direct output.
     * RETURNS : N/A                                                            */
    print: function(author, message, directout) {
        
    }
};