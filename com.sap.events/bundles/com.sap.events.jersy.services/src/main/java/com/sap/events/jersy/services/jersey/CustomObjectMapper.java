package com.sap.events.jersy.services.jersey;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

import javax.ws.rs.Produces;
import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;

@Provider
@Produces("application/json")
public class CustomObjectMapper implements ContextResolver<ObjectMapper> {

	public static final String ISO_8601_DATETIME = "yyyy-MM-dd'T'HH:mm:ss";

	public static final ObjectMapper MAPPER;

	static {
		MAPPER = new ObjectMapper() //
				.setPropertyNamingStrategy(PropertyNamingStrategy.PascalCaseStrategy.PASCAL_CASE_TO_CAMEL_CASE) //
				.setDateFormat(getDateFormat());
		MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,false);
	}

	public ObjectMapper getContext(Class<?> type) {
		return MAPPER;
	}

	/**
	 * Gets the date format for use with serialisation. Uses the local timezone/offset instead of the default
	 * UTC.
	 * 
	 * @return
	 */
	private static DateFormat getDateFormat() {
		DateFormat dateFormat = new SimpleDateFormat(ISO_8601_DATETIME);
		Calendar cal = Calendar.getInstance(TimeZone.getDefault());
		dateFormat.setCalendar(cal);
		return dateFormat;
	}

}