package com.sap.events.core.json;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TopNavigationHeader {

	private final String remove;
	private final String dpath;
	private final int lindex;
	private final int nindex;
	private final int totalIndex;
	
	@JsonCreator
	public TopNavigationHeader(@JsonProperty(value = "Remove") String remove,
			@JsonProperty(value = "Dpath") String dpath,
			@JsonProperty(value = "Lindex") int lindex,
			@JsonProperty(value = "Nindex") int nindex,
			@JsonProperty(value = "TotalIndex") int totalIndex) {
		this.remove = remove;
		this.dpath = dpath;
		this.lindex = lindex;
		this.nindex = nindex;
		this.totalIndex = totalIndex;		
	}
	
	public String getLNodeName() {
		return "Nav"+lindex;
	}
	
	public String getNNodeName() {
		return "Nav"+nindex;
	}
	
	public String getNewNodeName() {
		return "newName";
	}
	
	public String getRemoveOption() {
		return remove;
	}

	public String getDialogPath() {
		return dpath;
	}
	
	public String getJCR_PATH() {
		String NODE_NAME = dpath.substring(dpath.lastIndexOf("/")+1);		
		if(!NODE_NAME.equals("topNav")){ 
			return dpath.substring(0);
         }
		return dpath.substring(0, dpath.lastIndexOf("/"));
	}

	public int getLIndex() {
		return lindex;
	}

	public int getNIndex() {
		return nindex;
	}
	
	public int getTotalIndex() {
		return totalIndex;
	}
}