package com.sap.events.jersy.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.google.inject.ImplementedBy;
import com.sap.events.jersy.services.jersey.JerseyRestClient;


@ImplementedBy(JerseyRestClient.class)
public interface RestClient {

	/**
	 * @param <T>
	 * @param url
	 * @param responseClass
	 * @param AuthContext
	 * @return
	 */
	<T> T get(String url, Class<T> responseClass, AuthContext AuthContext);

	/**
	 * Performs GET using provided URL and auth cookie. TypeReference can be used to specify generic type for
	 * return value. If generics are not being used, specifying class may be simpler. Usage: <code>
	 * 	client.get("/url", new TypeReference<List<String>>(){}, AuthContext);
	 * </code>
	 * 
	 * @param url
	 * @param responseTypeReference
	 * @param AuthContext
	 * @return
	 */
	<T> T get(String url, TypeReference<T> responseTypeReference, AuthContext AuthContext);

	/**
	 * Performs PUT request using provided URL and auth cookie.
	 * 
	 * @param url
	 * @param AuthContext
	 */
	void put(String url, AuthContext AuthContext);

	/**
	 * Performs PUT request using provided URL and request object
	 * 
	 * @param url
	 * @param request
	 * @param AuthContext
	 */
	void put(String url, Object request, AuthContext AuthContext);

	/**
	 * Performs PUT request using provided url, request object and auth cookie.
	 * 
	 * @param <T>
	 * @param url
	 * @param request
	 * @param responseClass
	 * @param AuthContext
	 * @return
	 */
	<T> T put(String url, Object request, Class<T> responseClass, AuthContext AuthContext);

	/**
	 * Performs POST request using provided url, request object and auth cookie.
	 * 
	 * @param <T>
	 * @param url
	 * @param request
	 * @param responseClass
	 * @param AuthContext
	 * @return
	 */
	<T> T post(String url, Object request, Class<T> responseClass, AuthContext AuthContext);

	/**
	 * Performs GET using provided URL and auth cookie. TypeReference can be used to specify generic type for
	 * return value. If generics are not being used, specifying class may be simpler.
	 * <p>
	 * Usage:
	 * <p>
	 * <code>
	 * 	client.post("/url", "request", new TypeReference&lt;List&lt;String&gt;&gt;(){}, AuthContext);
	 * </code>
	 * 
	 * @param url
	 * @param request
	 * @param responseTypeReference
	 * @param AuthContext
	 * @return
	 */
	<T> T post(String url, Object request, TypeReference<T> responseTypeReference, AuthContext AuthContext);

	/**
	 * Performs POST request using provided url, request object and auth cookie. Use only when the TPD service
	 * does not return anything in the response. i.e. when response is void.
	 * 
	 * @param url
	 * @param request
	 * @param AuthContext
	 * @return void
	 */
	void post(String url, Object request, AuthContext AuthContext);

	/**
	 * Performs DELETE request using provided, parametrized url and AuthContext. Use only when the TPD service
	 * does not return anything in the response. i.e. when response is void.
	 * 
	 * @param url
	 * @param AuthContext
	 */
	void delete(String url, AuthContext AuthContext);

	/**
	 * Performs DELETE request using provided, parametrized url and AuthContext. Use only when the TPD service
	 * does not return anything in the response. i.e. when response is void.
	 * 
	 * @param url
	 * @param AuthContext
	 */
	void delete(String url, Object request, AuthContext AuthContext);

}
