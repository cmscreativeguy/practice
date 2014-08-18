package com.sap.events.jersy.services;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.google.inject.Inject;
import com.sap.events.jersy.services.osgi.IntegrationService;


public class ServiceUrlBuilder {
	
	private IntegrationService olbService;

	@Inject
	public ServiceUrlBuilder(IntegrationService olbService) {
		this.olbService = olbService;
	}

	/**
	 * Returns a URL using the specified format string and arguments. Each
	 * {@code String} object in the given arguments array will be encoded.
	 * 
	 * @param suffixPattern
	 * @param args
	 * @return
	 */
	public String create(String suffixPattern, Object... args) {
		List<Object> objects = new ArrayList<Object>();
		for (Object arg : args) {
			if (arg instanceof String) {
				objects.add(encode((String) arg));
			} else {
				objects.add(arg);
			}
		}
		String suffix = String.format(suffixPattern, objects.toArray());
		return this.olbService.getUrl() + suffix;
	}

	private static String encode(String param) {
		try {
			return URLEncoder.encode(param, "UTF-8").replaceAll("\\+", "%20");
		} catch (UnsupportedEncodingException e) {
			// Should never happen
			throw new IllegalArgumentException("Unsupported UTF-8 encoding exception", e);
		}
	}

	public String addParams(String uri, Map<String, String> params) {
		if (params == null || params.isEmpty()) {
			return uri;
		}
		StringBuilder sb = new StringBuilder(uri);
		Iterator<Entry<String, String>> entrySet = params.entrySet().iterator();

		if (!uri.contains("?")) {
			sb.append("?");
		} else if (!uri.endsWith("?")) {
			sb.append("&");
		}

		while (entrySet.hasNext()) {
			Entry<String, String> entry = entrySet.next();
			sb.append(encode(entry.getKey()));
			sb.append("=");
			sb.append(encode(entry.getValue()));
			if (entrySet.hasNext()) {
				sb.append("&");
			}
		}
		return sb.toString();
	}
}
