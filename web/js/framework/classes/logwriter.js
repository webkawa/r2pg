/* Log writing-entity.
 * PARAMETERS :
 *  > entity                Writing entity.                                     */

function LogWriter(entity) {
    Toolkit.checkTypeOf("LogWriter", "entity", entity, "object");
    if (typeof(entity.getLogID) !== "function") {
        var p = {
            entity: entity
        };
        throw new Error("log", 1, p);
    }
    
    /* Writing entity */
    this.entity = entity;
    this.getEntity = function() {
        return this.entity;
    };
    
    /* Messages count */
    this.count = 1;
    this.getCount = function() {
        return this.count;
    };
    this.increaseCount = function() {
        this.count++;
    };
    
    /* Log ID */
    this.logID = entity.getLogID();
    this.getLogID = function() {
        return this.logID;
    };
};