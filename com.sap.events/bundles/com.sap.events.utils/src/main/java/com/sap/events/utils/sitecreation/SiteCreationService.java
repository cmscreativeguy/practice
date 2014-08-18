package com.sap.events.utils.sitecreation;

import org.apache.sling.api.servlets.HtmlResponse;

import com.sap.events.core.json.SiteCreationJSON;

@SuppressWarnings("deprecation")
public interface SiteCreationService{  
   public HtmlResponse createEvent(SiteCreationJSON eventJSON) throws Exception;
}