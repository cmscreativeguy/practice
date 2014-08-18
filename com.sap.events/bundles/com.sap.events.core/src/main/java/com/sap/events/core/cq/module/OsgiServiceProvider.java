package com.sap.events.core.cq.module;

import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;

/**
 * Provider for felix OSGI services
 * 
 * @author Ashok_Pelluru
 *
 */
public class OsgiServiceProvider {
	
	private BundleContext bundleContext;
	
	public OsgiServiceProvider(BundleContext bundleContext) {
		this.bundleContext = bundleContext;
	}
	
	@SuppressWarnings("unchecked")
	public <ServiceType> ServiceType getService(Class<ServiceType> type) {
        ServiceType service = null;
        final ServiceReference ref = bundleContext.getServiceReference(type.getName());
        if (ref != null) {
            service = (ServiceType) bundleContext.getService(ref);
        }
        return service;
    }
}
