package drivers;

import exceptions.DriverException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;

/**
 *  Procedure.
 *  Stored SQL procedure, implementing setup/cache mechanism and supporting
 *  database connection.
 *      @author kawa
 */
public class Procedure extends HashMap<String[],Set> implements DriverITF {
    /**
     *  Life : no.
     */
    public static final long LIFE_NO = 0;
    /**
     *  Life : shortest (5 seconds).
     */
    public static final long LIFE_SHORTEST = 5000;
    /**
     *  Life : shorter (10 seconds).
     */
    public static final long LIFE_SHORTER = 10000;
    /**
     *  Life : short (30 seconds).
     */
    public static final long LIFE_SHORT = 30000;
    /**
     *  Life : medium (1 minute).
     */
    public static final long LIFE_MEDIUM = 60000;
    /**
     *  Life : long (3 minutes).
     */
    public static final long LIFE_LONG = 180000;
    /**
     *  Life : longer (10 minutes).
     */
    public static final long LIFE_LONGER = 600000;
    /**
     *  Life : longest (30 minutes).
     */
    public static final long LIFE_LONGEST = 1800000;
    
    /**
     *  Name.
     */
    private String name;
    /**
     *  Model.
     */
    private ArrayList<Parameter> model;
    /**
     *  Connection pool.
     */
    private Pool pool;
    /**
     *  Connector.
     */
    private PreparedStatement connector;
    /**
     *  Life duration.
     */
    private long life;
    
    /**
     *  Procedure constructor.
     *  Constructs procedure from name, parameters and life duration.
     *      @param name     Procedure name.
     *      @param params   Parameters (as array).
     */
    public Procedure(String name, Parameter[] params, long life) {
        super();
        
        this.name = name;
        this.model = new ArrayList<>();
        this.life = life;
        
        this.model.addAll(Arrays.asList(params));
    }

    /**
     *  Connection initiator.
     *  Initiate connection to a pool, then restore cache and connector.
     *      @param pool Connected pool.
     */
    protected void init(Pool pool) throws DriverException {
        this.prepare();
        this.pool = pool;
    }
    /**
     *  Connection preparation.
     *  Creates or re-creates the connector to the selected pool.
     */
    protected void prepare() throws DriverException {
        String query = this.getStatementQuery();
        if (!this.isConnected()) {
            throw new DriverException(this, "Try to prepare connector without defined pool.");
        }
        try {
            this.connector = this.pool.getConnection().prepareStatement(query);
        } catch (SQLException e) {
            throw new DriverException(this, "Unable to create connector.", e);
        }
    }
    /**
     *  Connection client.
     *  Submits a list of parameters to the procedure based on the current
     *  connection pool and returns corresponding XML image.
     *      @param args Arguments as array.
     *      @return     XML image.
     */
    protected String submit(String[] args) throws DriverException {
        // Initial checking
        if (!this.isPrepared()) {
            this.prepare();
        }
        if (args.length != this.model.size()) {
            throw new DriverException(this, "Invalid number of arguments submited.");
        }
        
        try {
            // Procedure setup
            for (int i = 0; i < this.model.size(); i++) {
                // Parameter check
                if (this.model.get(i).isMandatory() && args[i] == null) {
                    throw new DriverException(this, "Missing mandatory argument on submit.");
                }
                
                // Setter
                if (args[i] != null) {
                    switch (this.model.get(i).getType()) {
                        case Parameter.STRING:
                            this.connector.setString(i + 1, args[i]);
                            break;
                        case Parameter.INTEGER:
                            this.connector.setInt(i + 1, Integer.parseInt(args[i]));
                            break;
                        case Parameter.BOOLEAN:
                            this.connector.setBoolean(i + 1, args[i].equals("true"));
                            break;
                    }
                } else {
                    this.connector.setNull(i + 1, Types.NULL);
                }
            }
            
            // Procedure execution
            Set ns = new Set(this.connector.executeQuery());
            
            // Comparing to cache
            boolean save = false;
            if (super.containsKey(args)) {
                Set os = super.get(args);
                if (os.hasExpired(this.life)) {
                    save = !ns.challenge(os);
                }
            }
            
            // Saving changes if necessary
            if (save) {
                ns.generate();
                super.put(args, ns);
            }
            
            // Returning
            return super.get(args).getImage();
        } catch (SQLException e) {
            throw new DriverException(this, "Error while submiting setup.", e);
        }
    }
    /**
     *  Connection closing.
     *  Closes connection to database.
     */
    protected void close() throws DriverException {
        try {
            if (this.connector != null) {
                this.connector.close();
            }
        } catch (SQLException e) {
            throw new DriverException(this, "Unable to close connector.", e);
        }
    }
    
    /**
     *  @return Procedure name.
     */
    protected String getName()  {
        return this.name;
    }
    /**
     *  @return Procedure pool.
     */
    protected Pool getPool() {
        return this.pool;
    }
    /**
     *  @return Procedure prepared statement query.
     */
    protected String getStatementQuery() {
        String st = "CALL " + this.name + "(";
        for (int i = 0; i < this.model.size(); i++) {
            st += "?";
            if (i + 1 < this.model.size()) {
                st +=", ";
            }
        }
        st += ");";
        return st;
    }
    /**
     *  @return true if pool is defined, false else.
     */
    protected boolean isConnected() {
        return this.pool != null;
    }
    /**
     *  @return true if procedure is connected and prepared to use.
     */
    protected boolean isPrepared() throws DriverException {
        try {
            return this.isConnected() && this.connector != null && !this.connector.isClosed();
        } catch (SQLException e) {
            throw new DriverException(this, "Unable to get response from connector.", e);
        }
    }
}
