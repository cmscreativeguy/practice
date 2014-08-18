package com.sap.events.core.bundle;

import java.util.List;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognifide.slice.api.injector.InjectorRunner;
import com.cognifide.slice.commons.SliceModulesFactory;
import com.cognifide.slice.cq.module.CQModulesFactory;
import com.google.inject.Module;
import com.sap.events.core.cq.module.SAPModulesFactory;

 
public class Activator implements BundleActivator {
	
	@SuppressWarnings("unused")
	private static final Logger logger = LoggerFactory.getLogger(Activator.class);
	
    private static final String BUNDLE_NAME_FILTER = "com\\.sap\\.events\\..*"; 
    private static final String BASE_PACKAGE = "com.sap.events"; 
    private static final String INJECTOR_NAME = "events";
 
    @Override
    public void start(BundleContext bundleContext) throws Exception {
    	
        final InjectorRunner injectorRunner = new InjectorRunner(bundleContext, INJECTOR_NAME,
                BUNDLE_NAME_FILTER, BASE_PACKAGE);
        
        final List<Module> sliceModules = SliceModulesFactory.createModules(bundleContext);
        final List<Module> cqModules = CQModulesFactory.createModules();
        
        List<Module> sapModules = SAPModulesFactory.createModules(bundleContext);
 
        injectorRunner.installModules(sliceModules);
        injectorRunner.installModules(cqModules);
        injectorRunner.installModules(sapModules);
        
        injectorRunner.start();
    }
 
	@Override
	public void stop(BundleContext context) throws Exception {
		
	}
}