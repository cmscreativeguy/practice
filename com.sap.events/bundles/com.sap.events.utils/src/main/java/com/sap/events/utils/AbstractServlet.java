package com.sap.events.utils;

import java.io.BufferedReader;
import java.io.IOException;

import javax.servlet.ServletException;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.sap.events.jersy.services.jersey.CustomObjectMapper;

public abstract class AbstractServlet extends SlingAllMethodsServlet {
	
	private static final long serialVersionUID = 1L;
	
	@Override
	protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
		//your post method code here
	}
	
	@Override
	protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
		//your get method code here
	}
	
	public JsonNode getJsonObject(SlingHttpServletRequest request){
		BufferedReader reader;
		JsonNode object = null;
		try {
			reader = request.getReader();
			StringBuilder sb = new StringBuilder();
			String line = reader.readLine();
			while (line != null) {
				sb.append(line + "\n");
				line = reader.readLine();
			}
			reader.close();
			String data = sb.toString();
			
				// check if incoming String is encoded , Mainly for Browser request
				if (!data.equals(java.net.URLDecoder.decode(data, "UTF-8"))) {
					data = java.net.URLDecoder.decode(data, "UTF-8");
				}
			
			if (data != null) {
				object = CustomObjectMapper.MAPPER.readValue(data, JsonNode.class);
			}
			
			}catch (IOException e) {
				e.printStackTrace();
			}
		return object;
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
