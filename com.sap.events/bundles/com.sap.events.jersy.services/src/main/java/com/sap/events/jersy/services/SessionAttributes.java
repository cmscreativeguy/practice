package com.sap.events.jersy.services;

import javax.servlet.http.HttpSession;

import org.apache.sling.api.SlingHttpServletRequest;

import com.google.inject.Inject;

public class SessionAttributes {

	private final HttpSession session;

	@Inject
	public SessionAttributes(SlingHttpServletRequest request) {
		this.session = request.getSession();
	}

	public void set(String name, Object value) {
		this.session.setAttribute(name, value);
	}

	public <T> T get(String name, Class<T> clazz) {
		Object value = this.session.getAttribute(name);
		if (clazz.isInstance(value)) {
			return clazz.cast(value);
		}
		return null;
	}

	public boolean has(String name) {
		return this.session.getAttribute(name) != null;
	}

	public void remove(String name) {
		this.session.removeAttribute(name);
	}

	public long getSessionTimeout() {
		return session.getMaxInactiveInterval();
	}
}
