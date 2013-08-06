/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package drivers;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *  Pool daemon.
 *  Manage pool connection auto-close after a given amount of time following the
 *  las use of the pipe.
 *      @author kawa
 */
public class PoolDaemon extends Thread {
    /**
     *  Pool.
     */
    private Pool pool;
    /**
     *  Expiration.
     */
    private long expiration;
    
    /**
     *  Daemon constructor.
     *  Constructs the daemon from the pool reference and a given expiration time.
     *      @param pool         Owning pool.
     *      @param expiration   Expiration time.
     */
    public PoolDaemon(Pool pool, long expiration) {
        super();
        
        this.pool = pool;
        this.expiration = expiration;
    }
    
    /**
     *  Daemon starter.
     */
    @Override
    public void run() {
        try {
            super.wait(this.expiration);
        } catch (InterruptedException e) { } finally {
            this.pool.close();
        }
    }
}
