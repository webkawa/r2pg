package drivers;

import exceptions.DriverException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import javax.naming.InitialContext;
import javax.sql.DataSource;

/**
 *  Ressource pool.
 *  Manages a list of ressources connected to the database by a single,
 *  auto-opening access.
 *  @author kawa
 */
public class Pool extends HashMap<String,Ressource> implements DriverITF {
    
    /**
     *  Pool data source.
     */
    private DataSource ds;
    /**
     *  Connection access.
     */
    private Connection connection;
    
    /**
     *  Pool constructs.
     *  Constructs the pool based on a standard Glassfish JDBC pool.
     *      @param name Pool name.
     */
    public Pool(String name) throws DriverException {
        super();
        
        try {
            InitialContext ctx = new InitialContext();
            this.ds = (DataSource) ctx.lookup(name);
        } catch (Exception e) {
            throw new DriverException(this, "Error while initializing pool", e);
        }
    }
    
    /**
     *  Connector.
     *  Open connection to the database from the connection URL defined during
     *  pool construction.
     */
    protected void connect() throws DriverException {
        try {
            this.connection = this.ds.getConnection();
        } catch (SQLException e) {
            throw new DriverException(this, "Unable to connect database.", e);
        }
    }
    /**
     *  Closer.
     *  Closes connection to the database.
     */
    void close() {
        if (this.isConnected()) {
            try {
                this.connection.close();
            } catch (SQLException e) { } finally {
                this.connection = null;
            }
        }
    }
  
    /**
     *  @return true if pool is currently connected, false else.
     */
    public boolean isConnected() {
        if (this.connection == null) {
            return false;
        } else {
            try {
                return this.connection.isValid(0);
            } catch (SQLException e) {
                return false;
            }
        }
    }
    /**
     *  @return Open connection.
     */
    public Connection getConnection() throws DriverException {
        if (!this.isConnected()) {
            this.connect();
        }
        return this.connection;
    }
    
    /**
     *  Putter.
     *  Assures bi-directionnal linking between pool and ressource.
     *      @param key          Added key.  
     *      @param ressource    Added ressource.
     *      @return             Same as original method.
     */
    @Override
    public Ressource put(String key, Ressource ressource) {
        try {
            ressource.close();
        } catch (DriverException e) { } finally {
            ressource.setPool(this);
            return super.put(key, ressource);
        }
    }
    /**
     *  @return Driver name.
     */
    @Override
    public String getDriverName() {
        return "Pool[" + this.connection + "]";
    }
}
