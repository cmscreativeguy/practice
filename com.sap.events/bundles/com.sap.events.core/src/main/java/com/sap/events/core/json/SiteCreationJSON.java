package com.sap.events.core.json;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SiteCreationJSON {
	
	private final String action;
	private final String name;
	private final String title;
	private final String from;
	private final String to;
	private final String languages;
	private final String activate;
	
	@JsonCreator
	public SiteCreationJSON(@JsonProperty(value = "Action") String action,
			@JsonProperty(value = "Name") String name,
			@JsonProperty(value = "Title") String title,
			@JsonProperty(value = "From") String from,
			@JsonProperty(value = "To") String to,
			@JsonProperty(value = "Languages") String languages,
			@JsonProperty(value = "Activate") String activate) {
		
		this.action = action;
		this.name = name;
		this.title = title;
		this.from = from;
		this.to = to;
		this.languages = languages;
		this.activate = activate;
	}
	
	public String getAction() {
		return action.toLowerCase();
	}
	
	public String getEventName() {
		return name.toLowerCase();
	}
	
	public String getEventTitle() {
		return title;
	}
	
	public String getFromPath() {
		return from;
	}
	
	public String getToPath() {
		return to;
	}

	public String getLanguages() {
		return languages.toLowerCase();
	}	
	public String getAgentID() {
		return activate;
	}
}