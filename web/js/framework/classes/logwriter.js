/* Log writing-entity.
 * PARAMETERS :
 *  > entity                Writing entity.                                     */

function LogWriter(entity) {
    Toolkit.checkValue("LogWriter", "entity", entity, "object");
    
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
};