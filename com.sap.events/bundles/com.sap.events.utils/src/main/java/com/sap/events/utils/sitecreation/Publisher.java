package com.sap.events.utils.sitecreation;

import com.day.cq.replication.ReplicationException;
import javax.jcr.RepositoryException;
import org.apache.sling.api.servlets.HtmlResponse;

@SuppressWarnings("deprecation")
public interface Publisher {
    public HtmlResponse publishPage(String path, final String agentId) throws Exception;
    public HtmlResponse deactivatePage(String pagePath, final String agentId) throws Exception;
    public HtmlResponse deletePage(String pagePath) throws RepositoryException, Exception;    
}
