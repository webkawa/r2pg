package drivers;

import exceptions.DriverException;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletConfig;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *  Registered service.
 *  Generic standardized service, connected to a single pool and implementing
 *  one (or more) services.
 *  Only accepts POST requests.
 *      @author kawa
 */
public abstract class Service extends HttpServlet implements DriverITF {
    /**
     *  Loading status.
     */
    private static boolean STARTED = false;
    /**
     *  Configuration.
     */
    protected static Properties CONFIGURATION;
    /**
     *  Configuration files.
     */
    private static final String[] CONFIGURATION_FILES = {"default", "local"};
    /**
     *  Pools.
     */
    protected static HashMap<String,Pool> DATASOURCES;
    /**
     *  Pools name.
     */
    private static final String[] DATASOURCES_NAMES = {"MainPool"};
    
    /**
     *  Ready status.
     */
    protected boolean ready;
    /**
     *  Connected pool.
     */
    protected Pool pool;
    /**
     *  Ressources index.
     */
    protected HashMap<String,Ressource> ressources;
    /**
     *  Service GET.
     *  Unavailable access mode.
     *      @param request  GET request.
     *      @param response Standardized response.
     */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        this.doPost(request, response);
    }
    /**
     *  Service POST.
     *      @param request  POST request.
     *      @param response Standardized response.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String data  = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
               data += "<data xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"../models/data.xsd\" >";
        try {
            if (!this.ready) {
                throw new DriverException(this, "Try to launch unstarted service");
            } else {
                data += this.invoke(request);
            }
        } catch (DriverException e) {
            data += this.manage(e);
        } finally {
            data += "</data>";
            
            response.setCharacterEncoding("UTF-8");
            response.setContentType("text/xml");
            response.getWriter().print(data);
        }
    }
    
    /**
     *  Starts the sub-service.
     *      @param cfg  Servlet configuration.
     */
    protected abstract void start(ServletConfig cfg) throws DriverException;
    /**
     *  Service caller.
     *  Executes the service business logic (input treatment, ressources calls,
     *  post-treatment) and returns an XML standardized content.
     *      @param request Posted request.
     */
    protected abstract String invoke(HttpServletRequest request) throws DriverException;
    /**
     *  Initiator.
     *  Concludes initialization by switching status.
     *      @param cfg  Servlet configuration.
     */
    @Override
    public void init(ServletConfig cfg) {
        try {
            if (!Service.STARTED) {
                Service.CONFIGURATION = new Properties();
                for (int i = 0; i < Service.CONFIGURATION_FILES.length; i++) {
                    this.loadConfiguration(cfg, Service.CONFIGURATION_FILES[i]);
                }
                
                Service.DATASOURCES = new HashMap<>();
                for (int i = 0; i < Service.DATASOURCES_NAMES.length; i++) {
                    this.loadDataSource(Service.DATASOURCES_NAMES[i]);
                }
                Service.STARTED = true;
            }
            this.ressources = new HashMap<>();
            this.pool = Service.DATASOURCES.get("MainPool");
            this.ready = true;
        
            this.start(cfg);
        } catch (DriverException e) {
            this.manage(e);
        }
    }
    /**
     *  Exception manager.
     *  Treat and return a standardized exception description based on a driver
     *  exception.
     *      @param exception    Managed error.
     */
    protected String manage(DriverException e) {
        // Debug
        Logger.getLogger(Service.class.getName()).log(Level.SEVERE, "Driver exception !", e);
        
        // Display
        String data =   "<model alias=\"error\">" +
                            "<column alias=\"type\">value</column>" +
                            "<column alias=\"origin\">value</column>" +
                            "<column alias=\"message\">value</column>" +
                        "</model>";
        
        Throwable buff = e;
        do {
            if (buff instanceof DriverException) {
                DriverException de = (DriverException) buff;
                data += "<s>" +
                            "<i>DRIVER EXCEPTION</i>" +
                            "<i>" + de.getThrower().getDriverName() + "</i>" +
                            "<i>" + de.getMessage() + "</i>" +
                        "</s>";
            } else {
                data += "<s>" +
                            "<i>NATURAL EXCEPTION</i>" +
                            "<i>?</i>" +
                            "<i>" + buff.getMessage() + "</i>" +
                        "</s>";
            }
            buff = buff.getCause();
        } while (buff != null);
        
        return data;
    }
    
    /**
     *  Configuration loader.
     *  Loads a configuration file and adds it to the pile.
     *      @param cfg  Servlet configuration.
     *      @param name Configuration file name.
     */
    private void loadConfiguration(ServletConfig cfg, String name) throws DriverException {
        try {
            String path = cfg.getServletContext().getRealPath("/WEB-INF/" + name + ".properties");
            FileInputStream fis = new FileInputStream(path);
            Service.CONFIGURATION.load(fis);
        } catch (Throwable e) {
            throw new DriverException(this, "Unable to load configuration file", e);
        }
    }
    /**
     *  Data-source loader.
     *  Loads a data-source from the informations logged in the configuration
     *  and initializes the corresponding pool.
     *      @param name Data-source name.
     */
    private void loadDataSource(String name) throws DriverException {
        Service.DATASOURCES.put(name, new Pool(name));
    }
    
    /**
     *  @return Service pool.
     */
    protected Pool getPool() {
        return this.pool;
    }
}
