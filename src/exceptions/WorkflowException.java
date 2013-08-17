package exceptions;

/**
 *  Workflow exception.
 *  System error caused by a data-driving component.
 *      @author kawa
 */
public class WorkflowException extends Exception {
    /**
     *  Workflow exception constructor.
     *  Constructs a simple workflow exception.
     *      @param message  Error message.
     */
    public WorkflowException(String message) {
        super(message);
    }
}
