package drivers;

import exceptions.DriverException;
import java.util.ArrayList;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 *  Data alias.
 *  Describes a single data set alias, characterized by meta-informations such
 *  as level (name, stage) or properties (key, cache ...).
 */
public class Alias implements DriverITF, Comparable<Alias> {
    /**
     *  Owner.
     */
    private Set owner;
    /**
     *  Token.
     *  Origin token as returned by the procedure.
     */
    private String token;
    /**
     *  Name.
     *  Alias single name.
     */
    private String name;
    /**
     *  Level name.
     */
    private String level;
    /**
     *  Level stage.
     */
    private int stage;
    /**
     *  Key property.
     */
    private boolean key;
    
    /**
     *  Alias constructor.
     *  Constructs the alias based on his owner data set and a standardized
     *  token.
     *      @param owner    Owner data set.
     *      @param token    SQL token.
     */
    public Alias(Set owner, String token) throws DriverException {
        this.owner = owner;
        if (!Pattern.matches("[A-Z][A-Za-z0-9]*_[A-Z][A-Za-z0-9]*(_KEY)?", token)) {
            throw new DriverException(this, "Invalid token [" + token + "]");
        }
        this.token = token;
        this.name = token.substring(token.indexOf("_")).replace("_KEY", "");
        this.level = token.substring(0, token.indexOf("_"));
        this.stage = -1;
        this.key = token.substring(token.length() - 4).equals("_KEY");
        
        // Level finder
        int x = 0, y = 1;
        ArrayList<Alias> structure = this.owner.getStructure();
        for (int i = 0; i < structure.size(); i++) {
            if (structure.get(i).getLevel().equals(this.level)) {
                x = structure.get(i).getStage();
            }
        }
        if (x == 0) {
            x = y;
            y++;
        }
        this.stage = x;
    }
    
    /**
     *  @return Owner data set.
     */
    protected Set getOwner() {
        return this.owner;
    }
    /**
     *  @return Alias token.
     */
    protected String getToken() {
        return this.token;
    }
    /**
     *  @return Alias name.
     */
    protected String getName() {
        return this.name;
    }
    /**
     *  @return Alias level name.
     */
    protected String getLevel() {
        return this.level;
    }
    /**
     *  @return true if level stage defined, false else.
     */
    protected boolean hasStage() {
        return this.stage > 0;
    }
    /**
     *  @return Level stage.
     */
    protected int getStage() throws DriverException {
        if (!this.hasStage()) {
            throw new DriverException(this, "Undefined level stage.");
        }
        return this.stage;
    }
    /**
     *  @return Key property.
     */
    protected boolean isKey() {
        return this.key;
    }

    /**
     *  Alias level stage setter.
     *      @param stage New stage.
     */
    protected void setStage(int stage) throws DriverException {
        if (this.hasStage()) {
            throw new DriverException(this, "Alias already has defined level.");
        }
        this.stage = stage;
    }
    
    /**
     *  Object comparator.
     *      @param o    Challenged object.
     */
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Alias)) {
            return false;
        }
        return this.hashCode() == o.hashCode();
    }
    /**
     *  Hash generator.
     *      @return Alias hash code.
     */
    @Override
    public int hashCode() {
        int hash = 7;
        hash = 59 * hash + Objects.hashCode(this.name);
        hash = 59 * hash + Objects.hashCode(this.level);
        hash = 59 * hash + this.stage;
        hash = 59 * hash + (this.key ? 1 : 0);
        return hash;
    }
    /**
     *  Aliases comparator.
     *  Executes a comparison between current alias and another one. Selected
     *  alias presents the lowest (or undefined) level stage and key property
     *  activated.
     *      @param o    Challenged alias.
     *      @return     -1 if current alias goes first, 1 if challenged alias
     *                  goes first, 0 if they are equals.
     */
    @Override
    public int compareTo(Alias o) {
        boolean ori_hls = this.hasStage();
        boolean cmp_hls = o.hasStage();
        
        if (ori_hls && !cmp_hls)            return 1;
        if (!ori_hls && cmp_hls)            return -1;
        
        try {
            int ori_stage = this.getStage();
            int cmp_stage = o.getStage();
            
            if (ori_stage > cmp_stage)      return 1;
            if (ori_stage < cmp_stage)      return -1;
            
            boolean ori_key = this.isKey();
            boolean cmp_key = o.isKey();
            
            if (!ori_key && cmp_key)        return 1;
            if (ori_key && !cmp_key)        return -1;
        } catch (DriverException e) { } finally {
            return 0;
        }
    }
    /**
     *  @return Driver name.
     */
    @Override
    public String getDriverName() {
        return "Alias[" + this.owner.getDriverName() + "][" + this.name + "]";
    }
}
