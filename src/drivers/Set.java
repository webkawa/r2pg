package drivers;

import exceptions.DriverException;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;

/**
 *  Data set.
 *  Hashmap of rows generated from a standardized SQL result set and identified
 *  by a meta-structure.
 *      @author kawa
 */
public class Set extends HashMap<Integer,String[]> implements DriverITF {
    /**
     *  Structure.
     */
    private ArrayList<Alias> structure;
    /**
     *  XML image.
     */
    private String image;
    /**
     *  Last generation.
     */
    private long refresh;
   
    /**
     *  Set constructor.
     *  Constructs the data set from a pre-loaded SQL result set.
     *      @param rs   Base result set.
     */
    public Set(ResultSet rs) throws DriverException {
        super();
        this.structure = new ArrayList<>();
        
        try {
            // Filling structure
            ResultSetMetaData rsmd = rs.getMetaData();
            for (int i = 0; i < rsmd.getColumnCount(); i++) {
                this.structure.add(new Alias(this, rsmd.getColumnLabel(i)));
            }
            Collections.sort(this.structure);
            
            // Filling data
            String[] buff = new String[this.structure.size() + 1];
            while (rs.next()) {
                for (int i = 0; i < buff.length; i++) {
                    buff[i] = rs.getString(i);
                }
                super.put(rs.getRow(), buff);
            }
        } catch (SQLException e) {
            throw new DriverException(this, "Unable to construct data set.", e);
        }
    }
    
    /**
     *  Set challenger.
     *  Challenges current setup with another.
     *      @param set  Challenged set.
     *      @return     true if the two sets are equals, false else.
     */
    protected boolean challenge(Set set) {
        // Updating last refresh
        this.refresh = Calendar.getInstance().getTimeInMillis();
        
        // Structure challenge
        if (this.structure.size() != set.getStructure().size()) {
            return false;
        }
        for (int i = 0; i < this.structure.size(); i++) {
            if (!this.structure.get(i).equals(set.getStructure().get(i))) {
                return false;
            }
        }
        
        // Content challenge
        if (super.size() != set.size()) {
            return false;
        }
        for (int i = 1; i <= super.size(); i++) {
            if (!Arrays.equals(super.get(i), set.get(i))) {
                return false;
            }
        }
        
        // Equality
        return true;
    }
    /**
     *  Extracts output flow.
     *  Generates an XML output flow based on set content.
     */
    protected void generate() {
    }
    
    /**
     *  @return Set structure.
     */
    protected  ArrayList<Alias> getStructure() {
        return this.structure;
    }
    /**
     *  @return XML image.
     */
    protected String getImage() {
        return this.image;
    }
    /**
     *  @return Last refresh.
     */
    protected long getRefresh() {
        return this.refresh;
    }
    /**
     *  Checks last refresh for a given expiration time.
     *      @param time Life time.
     *      @return     true if set has expired, false else.
     */
    protected boolean hasExpired(long time) {
        return this.refresh < Calendar.getInstance().getTimeInMillis() - time;
    }
}
