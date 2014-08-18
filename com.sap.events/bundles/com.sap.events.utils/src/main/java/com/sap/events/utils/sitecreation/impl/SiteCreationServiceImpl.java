package com.sap.events.utils.sitecreation.impl;

import java.util.StringTokenizer;

import javax.jcr.RepositoryException;
import javax.jcr.Session;

import org.apache.felix.scr.annotations.Activate;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Deactivate;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.servlets.HtmlResponse;
import org.apache.sling.jcr.api.SlingRepository;
import org.apache.sling.jcr.resource.JcrResourceResolverFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.day.cq.commons.servlets.HtmlStatusResponseHelper;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import com.sap.events.core.json.SiteCreationJSON;
import com.sap.events.utils.sitecreation.SiteCreationService;

@SuppressWarnings("deprecation")
@Component(metatype=false, immediate=true)
@Service(value=SiteCreationService.class)
public class SiteCreationServiceImpl implements SiteCreationService{
	
	private static final Logger log = LoggerFactory.getLogger(SiteCreationServiceImpl.class);
	
	@Reference
    private JcrResourceResolverFactory resolverFactory;
    
    private ResourceResolver resolver;
	
	@Reference
	private SlingRepository repository;
	 
	private Session session;
     
 	private Session getSession() throws RepositoryException{ 	
 	    if(session == null)
 	    	session = repository.loginAdministrative(null);
 		return session;
 	}
 	
 	@Activate
	public void activate(){
 		try {
			session = repository.loginAdministrative(null);
		} catch (Exception e) {
			log.info("SiteCreation Service - activated - Exception" + e.getMessage());
		}		
	}	
	
	@Deactivate
	public void deactivate(){
		if(session != null){
			session.logout();
		}
	}

	@Override
	public HtmlResponse createEvent(SiteCreationJSON eventJSON)
			throws Exception {
		resolver = this.resolverFactory.getResourceResolver(getSession()); 
        PageManager pageMgr = resolver.adaptTo(PageManager.class);  
		
        Page newEvent = pageMgr.getPage(eventJSON.getToPath()+"/"+eventJSON.getEventName());
        String temp = null;
		if(newEvent == null){
			Page oldEvent = pageMgr.getPage(eventJSON.getFromPath());
			newEvent = pageMgr.copy(oldEvent, eventJSON.getToPath()+"/"+eventJSON.getEventName(), eventJSON.getEventName(), true, true);
			//getSession().save();
			
			StringTokenizer stk = new StringTokenizer(eventJSON.getLanguages(), ",");
			while (stk.hasMoreElements()){
				temp = stk.nextElement().toString().toLowerCase().trim();
				oldEvent = pageMgr.getPage(eventJSON.getFromPath()+"/"+temp);
				 pageMgr.copy(oldEvent, newEvent.getPath()+"/"+temp, temp, false, true);
				getSession().save();
			}
			
			return HtmlStatusResponseHelper.createStatusResponse(true, "Created");
			
		}else{
			return HtmlStatusResponseHelper.createStatusResponse(false, "Site Exists");
		}
	}
}