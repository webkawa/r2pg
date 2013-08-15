package exceptions;

import drivers.DriverITF;

/**
 *  Driver exception.
 *  System error caused by a data-driving component.
 *      @author kawa
 */
public class DriverException extends Exception {
    /**
     *  Error sender.
     */
    private DriverITF thrower;
    
    /**
     *  Driver exception constructor.
     *  Constructs a simple driver exception.
     *      @param thrower  Throwing component.
     *      @param message  Error message.
     */
    public DriverException(DriverITF thrower, String message) {
        super(message);
        this.thrower = thrower;
    }
    /**
     *  Driver exception constructor.
     *  Constructs a driver exception based on a cause.
     *      @param thrower  Throwing component.
     *      @param message  Error message.
     *      @param cause    Cause exception.
     */
    public DriverException(DriverITF thrower, String message, Throwable cause) {
        super(message, cause);
        this.thrower = thrower;
    };

    /**
     *  @return Thrower data-driving component.
     */
    public DriverITF getThrower() {
        return this.thrower;
    }
}
