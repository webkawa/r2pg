package exceptions;

import drivers.DriverITF;
import drivers.Pipe;

/**
 * Driver exception.
 * Error caused by the data driver or one subcomponent.
 *  @author kawa
 */
public class DriverException extends Exception {
    /**
     *  Responsible driver component.
     */
    private DriverITF component;
    
    
    /**
     * Constructs the driver exception.
     *  @param component Responsible driver component.
     *  @param message   Error message.
     */
    public DriverException(DriverITF component, String message) {
        this(component, message, null);
    };
    /**
     * Constructs the driver exception.
     *  @param component Responsible driver component.
     *  @param message   Error message.
     *  @param cause     Error cause.
     */
    public DriverException(DriverITF component, String message, Exception cause) {
        super(message, cause);
        this.component = component;
    };

    /**
     *  @return Responsible driver component.
     */
    public DriverITF getComponent() {
        return this.component;
    };
}
