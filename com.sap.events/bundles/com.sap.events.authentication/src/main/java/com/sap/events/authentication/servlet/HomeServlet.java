package com.sap.events.authentication.servlet;

import java.io.IOException;

import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.sling.SlingServlet;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Ashok Pelluru
 *
 */
@SlingServlet(paths="/bin/test")
@Properties({
	@Property(name=Constants.SERVICE_DESCRIPTION, value="Partner portal redirect to Home Servlet"),
	@Property(name=Constants.SERVICE_VENDOR, value="SAP UK Ltd")
})
public class HomeServlet extends SlingAllMethodsServlet {
	
	private static final long serialVersionUID = 8155579152265422743L;
	
	protected final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Override
	protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
		logger.info("TESTING");
		response.setStatus(200);
	}
}
