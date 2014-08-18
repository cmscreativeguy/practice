package com.sap.events.jersy.services;

import java.util.List;

import javax.ws.rs.core.Cookie;

public interface AuthContext {

	Cookie getAuthCookie();
	
	void setCookies(List<? extends Cookie> list);

	String getGcn();
	
	void clean();

	String getUserId();
	String getUserAgent();
	String getClientIp();
	/*
	 * Replacement for UserContext.containAuthCookie
	 */
	boolean isAuthenticated();
}