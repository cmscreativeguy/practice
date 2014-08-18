package com.sap.events.utils;

import java.io.IOException;

import javax.jcr.Node;
import javax.jcr.Session;
import javax.servlet.ServletException;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.jcr.api.SlingRepository;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;
import com.sap.events.core.json.TopNavigationHeader;
import com.sap.events.jersy.services.jersey.CustomObjectMapper;

@Component
@Service
@Properties(value = {
       @Property(name = "sling.servlet.paths", value = "/bin/changenodes"),
       @Property(name=Constants.SERVICE_DESCRIPTION, value="Change nodes positions servlet"),
       @Property(name=Constants.SERVICE_VENDOR, value="Ashok Pelluru")
})
public class ChangeNodesServlet extends AbstractServlet {
	
	private static final long serialVersionUID = 1L;
	
	protected final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	private final String RESOURCE_TYPE = "sapphirenow_web/components/foundation/secondLevelNav";
	
    @Reference
    private SlingRepository repository;
    
    private Session session;
	
	@Override
	protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
		changeNodesOrder(request, response);
	}
	
	private void createNode(Node HEAD_NODE, String Name){
	   Node TEMP_NEXT_NODE;
	   try {
			TEMP_NEXT_NODE = HEAD_NODE.addNode(Name, "nt:unstructured");
			TEMP_NEXT_NODE.setProperty("sling:resourceType", RESOURCE_TYPE);
		 	HEAD_NODE.getSession().save();		 	   
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@SuppressWarnings("deprecation")
	private void changeNodesOrder(SlingHttpServletRequest request, SlingHttpServletResponse response)
    {   
       try{
    	   response.setContentType("application/json");
    	   response.setCharacterEncoding("UTF-8");
    	   
    	   session = repository.loginAdministrative(null);
    	   
    	   JsonNode object = getJsonObject(request);  
    	   for(int o=0; o<object.size(); o++){    		   
    		   TopNavigationHeader topNavHeader = CustomObjectMapper.MAPPER.readValue(object.get(o).toString(), TopNavigationHeader.class);
    		   Node HEAD_NODE = session.getNode(topNavHeader.getJCR_PATH());
    		   
    		   if ((topNavHeader.getNIndex() > 0) && (!HEAD_NODE.hasNode(topNavHeader.getNNodeName()))) {
		          createNode(HEAD_NODE, topNavHeader.getNNodeName());
		        }
		        if ((topNavHeader.getLIndex() > 0) && (!HEAD_NODE.hasNode(topNavHeader.getLNodeName()))) {
		          createNode(HEAD_NODE, topNavHeader.getLNodeName());
		        }
    		    		   
    		   if("no".equals(topNavHeader.getRemoveOption())){
            	   HEAD_NODE.getSession().move(HEAD_NODE.getNode(topNavHeader.getLNodeName()).getPath(), HEAD_NODE.getPath()+"/"+topNavHeader.getNewNodeName());
            	   HEAD_NODE.getSession().move(HEAD_NODE.getNode(topNavHeader.getNNodeName()).getPath(), HEAD_NODE.getPath()+"/"+topNavHeader.getLNodeName());
            	   HEAD_NODE.getSession().move(HEAD_NODE.getPath()+"/"+topNavHeader.getNewNodeName(), HEAD_NODE.getPath()+"/"+topNavHeader.getNNodeName());
            	   HEAD_NODE.getSession().save();
    		   }
    		   
    		   if("yes".equals(topNavHeader.getRemoveOption())){
    			   HEAD_NODE.getNode(topNavHeader.getNNodeName()).remove();
    		       HEAD_NODE.getSession().save();
    		       
    			   for(int i = topNavHeader.getNIndex()+1; i <= topNavHeader.getTotalIndex(); i++){
    				   String tempNode = "Nav"+i;
    	               String actualNode = "Nav"+(i-1);
    	               if(HEAD_NODE.hasNode(tempNode)){	                    
   	                    	HEAD_NODE.getSession().move(HEAD_NODE.getNode(tempNode).getPath(), HEAD_NODE.getPath()+"/"+actualNode);
   	                   }
    			   }
    			   HEAD_NODE.getSession().save();
    		   }
    	   }
    	   response.setStatus(200, "OK");
    	   
       }catch(Exception ex)
       {
           ex.printStackTrace();
       }finally{
			if(session != null)
				session.logout();
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
