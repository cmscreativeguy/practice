package com.sap.events.core.cq.module;

import org.osgi.framework.BundleContext;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;

public final class OsgiModule extends AbstractModule {


	private OsgiServiceProvider serviceProvider;
	

	public OsgiModule(BundleContext bundleContext) {
		this.serviceProvider = new OsgiServiceProvider(bundleContext);
	}

	@Override
	protected void configure() {
	}

	@Provides
    public OsgiServiceProvider getServiceProvider() {
        return serviceProvider;
    }
	
}
