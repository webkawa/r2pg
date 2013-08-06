package drivers;

import java.sql.Connection;
import java.util.HashMap;

/**
 *
 * @author kawa
 */
public class Pool extends HashMap<String,Procedure> implements DriverITF {
    public Connection getConnection() {
        return null;
    }
}
