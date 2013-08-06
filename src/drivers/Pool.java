package drivers;

import exceptions.DriverException;
import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *  Ressource pool.
 *  Manages a list of ressources connected to the database by a single,
 *  auto-opening access.
 *  @author kawa
 */
public class Pool extends HashMap<String,Ressource> implements DriverITF {
    /**
     *  Test timeout.
     */
    public static final int TIMEOUT = 100;
    
    /**
     *  Database address.
     */
    private String db_address;
    /**
     *  Database port.
     */
    private int db_port;
    /**
     *  Database login.
     */
    private String db_login;
    /**
     *  Database password.
     */
    private String db_password;
    /**
     *  Database name.
     */
    private String db_name;
    /**
     *  Connection URL.
     */
    private String connection_url;
    /**
     *  Connection access.
     */
    private Connection connection_pipe;
    /**
     *  Connection daemon.
     */
    private PoolDaemon connection_daemon;
    
    /**
     *  Pool constructs.
     *  Constructs the ressource pool from a set of authentification
     *  informations used to access the hosting SQL database.
     *      @param address  DB access.
     *      @param port     DB port.
     *      @param login    DB login.
     *      @param password DB password.
     *      @param name     DB name.
     */
    public Pool(String address, int port, String login, String password, String name) throws DriverException {
        super();
        
        this.db_address = address;
        this.db_port = port;
        this.db_login = login;
        this.db_password = password;
        this.db_name = name;
        this.connection_url = "jdbc:mysql://" + address + ":" + port + "/" + name + "?user=" + login + "&password=" + password;
        
        try {
            DriverManager.registerDriver((Driver) Class.forName("com.mysql.jbdc.Driver").newInstance());
        } catch (SQLException|ClassNotFoundException|InstantiationException|IllegalAccessException e) {
            throw new DriverException(this, "Unable to load driver.", e);
        }
    }
    
    /**
     *  Connector.
     *  Open connection to the database from the connection URL defined during
     *  pool construction.
     */
    protected void connect() throws DriverException {
        if (this.connection_daemon != null) {
            this.connection_daemon.interrupt();
        }
        try {
            this.connection_pipe = DriverManager.getConnection(this.connection_url);
            this.connection_daemon = new PoolDaemon(this, 600000);
            this.connection_daemon.start();
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
                this.connection_daemon.interrupt();
                this.connection_pipe.close();
            } catch (SQLException e) { } finally {
                this.connection_daemon = null;
                this.connection_pipe = null;
            }
        }
    }
    
    /**
     *  @return Database address.
     */
    protected String getDBAddress() {
        return this.db_address;
    }
    /**
     *  @return Database port.
     */
    protected int getDBPort() {
        return this.db_port;
    }
    /**
     *  @return Database login.
     */
    protected String getDBLogin() {
        return this.db_login;
    }
    /**
     *  @return Database password.
     */
    protected String getDBPassword() {
        return this.db_password;
    }
    /**
     *  @return true if pool is currently connected, false else.
     */
    public boolean isConnected() {
        if (this.connection_pipe == null) {
            return false;
        } else {
            try {
                return this.connection_pipe.isValid(Pool.TIMEOUT);
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
        return this.connection_pipe;
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
}
