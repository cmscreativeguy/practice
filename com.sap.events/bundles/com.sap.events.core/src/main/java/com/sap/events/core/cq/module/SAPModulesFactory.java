package com.sap.events.core.cq.module;

import java.util.ArrayList;
import java.util.List;

import org.osgi.framework.BundleContext;

import com.google.inject.Module;

/**
 * 
 * @author Ashok Pelluru
 * 
 */
public class SAPModulesFactory {

	private SAPModulesFactory() {
	}

	/**
	 * Creates and returns a list of all SAP-related modules. The list includes:<br>
	 * <ul>
	 * <li>{@link OsgiModule}</li>
	 * </ul>
	 * 
	 * @return list of CQ-related modules
	 */
	public static List<Module> createModules(final BundleContext bundleContext) {
		List<Module> modules = new ArrayList<Module>();
		modules.add(new OsgiModule(bundleContext));
		return modules;
	}

}
