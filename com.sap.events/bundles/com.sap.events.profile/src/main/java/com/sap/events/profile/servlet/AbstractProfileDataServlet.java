package com.sap.events.profile.servlet;

import java.io.IOException;
import java.util.Map;

import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.apache.sling.commons.json.JSONException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AbstractProfileDataServlet extends SlingAllMethodsServlet {
	
	private static final long serialVersionUID = -3838516667852843463L;
	
	protected final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	protected void writeJSONResponse(Map<String, String> params, SlingHttpServletResponse response, boolean success, String message) throws JSONException, IOException {
		
		response.setContentType("application/json;charset=utf-8");	
			
		response.getWriter().write("{\"OK\":\"OK\"}");
	}	
}
