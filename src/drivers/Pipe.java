package drivers;

import exceptions.DriverException;
import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 *  SQL connection pipe.
 *  Allows establishing and manage a connection to the MySQL data source.
 */
public class Pipe implements DriverITF {
    /*
     *  Static.
     */
    public static final String CPN_NAME = "Connection";
    public static final int CX_TIMEOUT = 100;
    
    /**
     *  Connector owner.
     */
    private Service owner;
    /**
     *  Host.
     */
    private String host;
    /**
     *  Port.
     */
    private int port;
    /**
     *  Database name.
     */
    private String name;
    /**
     *  Full connection URL.
     */
    private String url;
    /**
     *  Connection.
     */
    private Connection connection;
    
    /**
     * Main constructor.
     * Prepares connection for use.
     *  @param owner     Using service.
     *  @param host      DB address.
     *  @param port      DB connection port.
     *  @param name      DB name.
     */
    public Pipe(Service owner, String host, int port, String name) throws DriverException {
        if (owner == null)              throw new DriverException(this, "Undefined owner");
        if (host == null)               throw new DriverException(this, "Undefined host");
        if (name == null)               throw new DriverException(this, "Undefined name");
        
        try {
            DriverManager.registerDriver((Driver) Class.forName("com.mysql.jbdc.Driver").newInstance());
        } catch (SQLException e) {
            throw new DriverException(this, "SQL exception while loading driver", e);
        } catch (ClassNotFoundException e) {
            throw new DriverException(this, "Driver not found exception while loading driver", e);
        } catch (InstantiationException e) {
            throw new DriverException(this, "Instanciation exception while loading driver", e);
        } catch (IllegalAccessException e) {
            throw new DriverException(this, "Illegal access exception while loading driver", e);
        }
        this.owner = owner;
        this.host = host;
        this.port = port;
        this.url = "jdbc:mysql://" + host + ":" + port + "/" + name;
    }
    
    /**
     *  Initiates connection.
     */
    public void connect() throws DriverException {
        try {
            this.connection.close();
            this.connection = DriverManager.getConnection(this.url);
        } catch (SQLException e) {
            throw new DriverException(this, "SQL exception while connecting", e);
        }
    };
    
    /**
     * Executes an SQL request.
     *  @param sql  SQL request.
     *  @return     Result as a result set object.
     */
    protected ResultSet execute(String sql) throws DriverException {
        if (sql == null)                    throw new DriverException(this, "Undefined SQL command");
        
        try {
            if (!this.connection.isValid(Pipe.CX_TIMEOUT)) {
                this.connect();
            }
            return this.connection.createStatement().executeQuery(sql);
        } catch (SQLException e) {
            throw new DriverException(this, "SQL exception during statement execution", e);
        }
    }
    
    /**
     *  @return Connection host.
     */
    protected String getHost() {
        return this.host;
    }
    /**
     *  @return Connection port.
     */
    protected int getPort() {
        return this.port;
    }
    /**
     *  @return Connection name.
     */
    protected String getName() {
        return this.name;
    }
    /**
     *  @return Driver component name.
     */
    @Override
    public String getDCName() {
        return Pipe.CPN_NAME + "(" + this.owner + ")";
    };
}
