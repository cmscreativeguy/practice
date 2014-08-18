package com.sap.events.utils.sitecreation;

import java.io.IOException;

import javax.servlet.ServletException;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.HtmlResponse;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.day.cq.commons.servlets.HtmlStatusResponseHelper;
import com.fasterxml.jackson.databind.JsonNode;
import com.sap.events.core.json.SiteCreationJSON;
import com.sap.events.jersy.services.jersey.CustomObjectMapper;
import com.sap.events.utils.AbstractServlet;

@SuppressWarnings("deprecation")
@Component
@Service
@Properties(value = {
       @Property(name = "sling.servlet.paths", value = "/bin/siteaction"),       
       @Property(name=Constants.SERVICE_DESCRIPTION, value="Create site from .net dashboard"),
       @Property(name=Constants.SERVICE_VENDOR, value="Ashok Pelluru")
})
public class SiteCreationServlet extends AbstractServlet{  
    
	private static final long serialVersionUID = -8866668590779348653L;
	private static final Logger log = LoggerFactory.getLogger(SiteCreationServlet.class);  
	
    private HtmlResponse htmlResponse;
    
    @Reference
    private SiteCreationService siteService;
       
    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, 
            IOException {
    	createEvent(request, response);          
    }
    
    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, 
            IOException {
    	createEvent(request, response);
    }
    
    private void createEvent(SlingHttpServletRequest request, SlingHttpServletResponse response)
    		throws ServletException, IOException{
            try{    
            	
            	//String json = "{\"Action\": \"create\", \"Name\":\"SITE_NAME1\", \"Title\": \"EVENT_TITILE\", \"From\": \"/content/sep/site-online\", \"To\": \"/content/sep\", \"Languages\":\"en_us, nl_nl\", \"Activate\": \"STAGING_OR_LIVE\" }";
            	
        	 	response.setContentType("application/json");
      	   		response.setCharacterEncoding("UTF-8");
      	   		
      	   		JsonNode object = getJsonObject(request);      	   		
      	   		SiteCreationJSON eventJSON = CustomObjectMapper.MAPPER.readValue(object.toString(), SiteCreationJSON.class);
      	   		
      	   		if(siteService != null){
      	   			htmlResponse =	siteService.createEvent(eventJSON);
      	   		}
      	   		
      	   		if(htmlResponse.getStatusMessage().equals("Created")){                            
      	   			
      	   		} 
      	   		               
               }catch(Exception e){                     
                    htmlResponse = HtmlStatusResponseHelper.createStatusResponse(false, e.getMessage());
              }finally {			    
                 if(htmlResponse != null)
                    htmlResponse.send(response, true);
              }
	}
    
    @Override
	public void init() throws ServletException {
		super.init();
	}
	
	@Override
	public void destroy() {
		super.destroy();
	}	
}