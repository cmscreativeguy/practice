package com.sap.events.utils;

import java.io.IOException;

import javax.servlet.ServletException;

import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.sling.SlingServlet;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SlingServlet(paths="/bin/test")
@Properties({
	@Property(name=Constants.SERVICE_DESCRIPTION, value="SAP Virtual Events Testing Servlet"),
	@Property(name=Constants.SERVICE_VENDOR, value="Ashok Pelluru")
})
public class TestServlet extends SlingAllMethodsServlet {
	
	/** */
	private static final long serialVersionUID = 8155579152265422743L;
	/** */
	protected final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Override
	protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
		logger.info("RegistrationServlet");
		response.getWriter().write("OK");
		
	}
	
	@Override
	public void init() throws ServletException {
		super.init();
		logger.debug("RegistrationServlet - init()");
	}
	@Override
	public void destroy() {
		super.destroy();
		logger.debug("RegistrationServlet - destroy()");
	}

}
