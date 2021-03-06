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
        this.refresh = Calendar.getInstance().getTimeInMillis();
        
        try {
            // Filling structure
            ResultSetMetaData rsmd = rs.getMetaData();
            for (int i = 0; i < rsmd.getColumnCount(); i++) {
                this.structure.add(new Alias(this, rsmd.getColumnLabel(i + 1)));
            }
            Collections.sort(this.structure);
            
            // Filling data
            while (rs.next()) {
                String[] buff = new String[this.structure.size()];
                for (int i = 0; i < buff.length; i++) {
                    buff[i] = rs.getString(i + 1);
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
    protected void generate() throws DriverException {
        int buff = 0;
        Alias bfa;
        
        // Headers
        this.image = "";
        for (int i = 0; i < this.structure.size(); i++) {
            bfa = this.structure.get(i);
            if (bfa.getStage() != buff) {
                buff = bfa.getStage();
                if (i != 0) {
                    this.image += "</model>";
                }
                this.image += "<model alias=\"" + bfa.getLevel() + "\">";
            }
            this.image += "<column alias=\"" + bfa.getName() + "\">";
            if (bfa.isKey()) {
                this.image += "key";
            } else {
                this.image += "value";
            }
            this.image += "</column>";
        }
        this.image += "</model>";
        
        int[] guide = new int[super.size()];
        int ssize = this.structure.size();
        int mstage = this.getMaximumStage();
        int[] starts = new int[mstage];
        
        // Guide
        guide[0] = 1;
        for (int i = 2; i <= super.size(); i++) {
            for (int j = 0; j < ssize && j != -1; j++) {
                if (!super.get(i)[j].equals(super.get(i - 1)[j])) {
                    guide[i - 1] = this.structure.get(j).getStage();
                    j = -2;
                }
            }
        }
        
        // Starts
        starts[0] = 0;
        for (int i = 2; i <= mstage; i++) {
            for (int j = starts[i - 2]; j < this.structure.size() && j != -1; j++) {
                if (this.structure.get(j).getStage() == i) {
                    starts[i - 1] = j;
                    j = -2;
                }
            }
        }
        
        // Body
        buff = 1;
        for (int i = 0; i < super.size(); i++) {
            this.image += "<s>";
            for (int j = starts[buff - 1]; j != -1; j++) {
                this.image += "<i>";
                this.image += super.get(i + 1)[j];
                this.image += "</i>";
                if (j == ssize - 1) {
                    if (i + 1 == super.size()) {
                        for (int k = mstage; k > 0; k--)                this.image += "</s>";
                    } else {
                        for (int k = mstage; k >= guide[i + 1]; k--)     this.image += "</s>";
                        buff = guide[i + 1];
                    }
                    j = -2;
                } else if (this.structure.get(j + 1).getStage() > buff) {
                    this.image += "<s>";
                    buff++;
                }
            }
        }
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
    /**
     *  @return Maximum level stage in current structure.
     */
    protected int getMaximumStage() throws DriverException {
        int x = 0;
        for (int i = 0; i < this.structure.size(); i++) {
            if (this.structure.get(i).getStage() > x) {
                x = this.structure.get(i).getStage();
            }
        }
        return x;
    }
    
    /**
     *  @return Driver name.
     */
    @Override
    public String getDriverName() {
        return "Set";
    }
}
