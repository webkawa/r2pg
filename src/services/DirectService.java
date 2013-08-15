package services;

import drivers.Parameter;
import drivers.Ressource;
import drivers.Service;
import exceptions.DriverException;
import javax.servlet.ServletConfig;
import javax.servlet.http.HttpServletRequest;

/**
 *  Direct service.
 *  Allows a direct, simple call to a standardized ressource configured through
 *  the servlet instanciation parameters.
 *      @author kawa
 */
public class DirectService extends Service {
    /**
     *  Base ressource.
     */
    private Ressource base;
    
    /**
     *  Starter.
     *  Initiates the direct service from the servlet "procedure" parameter.
     *  The syntax of the procedure has to respect the syntax : name.p0.p1.pN ...
     *  Where : - "name" is the SQL procedure syntax ;
     *          - "pN" (N: 0 to N) is a single parameter, defined as litteral
     *            type (string, integer, boolean ...) followed by the "*"
     *            character indicating a mandatory status.
     *      @param cfg  Servlet configuration.
     */
    @Override
    protected void start(ServletConfig cfg) {
        try {
            String[] cut = cfg.getInitParameter("procedure").split("\\.");
            String proc = cut[0];
            Parameter[] param = new Parameter[cut.length - 1];
            for (int i = 1; i < cut.length; i++) {
                short type;
                boolean mandatory = cut[i].contains("*");
                switch (cut[i - 1].replace("*", "")) {
                    case "string": type = Parameter.STRING; break;
                    case "integer": type = Parameter.INTEGER; break;
                    case "boolean": type = Parameter.BOOLEAN; break;
                    default: type = Parameter.STRING; break;
                }
                param[i - 1] = new Parameter(type, mandatory);
            }
            Ressource r = new Ressource(proc, param, Ressource.LIFE_NO);
            
            super.pool.put("base", r);
            this.base = r;
        } catch (Exception e) {
            super.manage(new DriverException(this, "Error on direct service start"));
        }
    }
    /**
     *  Invoker.
     *  Submits the base ressource from a set of parameters (named from p0 to pN)
     *  and returns the resulting XML image.
     *      @param request  Servlet request.   
     */
    @Override
    protected String invoke(HttpServletRequest request) throws DriverException {
        String params[] = new String[this.base.getModelSize()];
        for (int i = 0; i < params.length; i++) {
            params[i] = request.getParameter("p" + i);
        }
        return this.base.submit(params);
    }
    /**
     *  @return Driver name.
     */
    @Override
    public String getDriverName() {
        if (this.base == null) {
            return "DirectService[Unstarted]";
        }
        return "DirectService[" + this.base.getDriverName() + "]";
    }
}
