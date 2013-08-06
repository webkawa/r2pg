package drivers;

/**
 *  Setup parameter.
 *  Single procedure setup parameter.
 *      @author kawa
 */
public class Parameter {
    /**
     *  String type.
     */
    public final static short STRING = 0;
    /**
     *  Integer type.
     */
    public final static short INTEGER = 1;
    /**
     *  Boolean type.
     */
    public final static short BOOLEAN = 2;
    
    /**
     *  Type.
     */
    private short type;
    /**
     *  Mandatory.
     */
    private boolean mandatory;
    
    /**
     *  Parameter constructor.
     *  Constructs the parameter by initializing it properties.
     *      @param type         Parameter type.
     *      @param mandatory    Mandatory input.
     */
    public Parameter(short type, boolean mandatory) {
        this.type = type;
        this.mandatory = mandatory;
    }
    
    /**
     *  @return Type.
     */
    protected short getType() {
        return this.type;
    }
    /**
     *  @return Mandatory status.
     */
    protected boolean isMandatory() {
        return this.mandatory;
    }
}
