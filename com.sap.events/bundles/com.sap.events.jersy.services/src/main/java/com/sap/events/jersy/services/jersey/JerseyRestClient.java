package com.sap.events.jersy.services.jersey;

import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

import com.sap.events.jersy.services.AuthContext;
import com.sap.events.jersy.services.RestClient;
import com.sap.events.jersy.services.error.ClientException;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;

@Singleton
public class JerseyRestClient implements RestClient {

	private static final Logger LOG = LoggerFactory.getLogger(JerseyRestClient.class);

	private Client applicationClient;	
	
	private final Provider<Client> clientProvider;

	@Inject
	public JerseyRestClient(Provider<Client> clientProvider) {		
		this.clientProvider = clientProvider;
	}
	
	public JerseyRestClient(String s) {		
		clientProvider = null;
	}

	private interface ClientRequest {
		ClientResponse execute(WebResource.Builder webResource, Object request);
	}

	private <T> T handleRequest(String url, Object request, Class<T> responseClass, AuthContext authContext, 
			ClientRequest clientRequest) {
		LOG.debug("Start of execution: "+url);
		Client client = getClient();
		WebResource webResource = client.resource(url);
		ClientResponse clientResponse = null;
		String responseString=null;
		try {
			WebResource.Builder webResourceBuilder = 
					webResource.type(MediaType.APPLICATION_JSON_TYPE)
					.accept("application/vnd.investec.uxp.v1.0.0.0+json")
					.header("CLIENT_IP", authContext.getClientIp())
					.header(HttpHeaders.USER_AGENT, authContext.getUserAgent())
					.cookie(authContext.getAuthCookie());

			clientResponse = clientRequest.execute(webResourceBuilder, request);
			
			if(clientResponse.getHeaders().containsKey("Set-Cookie")){
				authContext.setCookies(clientResponse.getCookies());		
				LOG.debug("Cookis getting reset");
			}
			
			if (clientResponse.getClientResponseStatus().getStatusCode() < 300) {
				if (responseClass != null && clientResponse.hasEntity()) {
					T response=null;
					responseString =  clientResponse.getEntity(String.class);
					LOG.debug("responseString: "+responseString);
					if(responseString!=null && String.class.getSimpleName().equalsIgnoreCase(responseClass.getSimpleName())){
						return (T) responseString;
					}
					response = CustomObjectMapper.MAPPER.readValue(responseString,responseClass);
					return response;
				} else {
					return null;
				}
			} else {
				throw  new ClientException();
			}
		} catch (Throwable ex) {
			LOG.error("Error occured while executing "+url+":" +ex.getMessage());
			throw new ClientException(ex);
		} finally {
			LOG.debug("End of execution: "+url);
			closeResponse(clientResponse);
		}
	}

	private void closeResponse(ClientResponse clientResponse) {
		if (clientResponse != null) {
			try {
				clientResponse.close();
			} catch (ClientHandlerException ex) {
				LOG.error(ex.getMessage());
			}
		}
	}

	@Override
	public <T> T get(String url, final Class<T> responseClass, AuthContext AuthContext) {
		return handleRequest(url, null, responseClass, AuthContext, new ClientRequest() {
			@Override
			public ClientResponse execute(WebResource.Builder webResourceBuilder, Object request) {
				return webResourceBuilder.get(ClientResponse.class);
			}
		});
	}

	@SuppressWarnings("unchecked")
	@Override
	public <T> T get(String url, TypeReference<T> responseTypeReference, AuthContext AuthContext) {
		Class<?> responseType = getRawClass(responseTypeReference);
		return (T) get(url, responseType, AuthContext);
	}

	@Override
	public void put(String url, AuthContext AuthContext) {
		final Object request = "";
		final Class<?> responseClass = null;
		handleRequest(url, request, responseClass, AuthContext, new ClientRequest() {
			@Override
			public ClientResponse execute(WebResource.Builder webResourceBuilder, Object request) {
				return webResourceBuilder.put(ClientResponse.class, request);
			}
		});
	}

	@Override
	public void put(String url, Object request, AuthContext AuthContext) {
		final Class<?> responseClass = null;
		handleRequest(url, request, responseClass, AuthContext, new ClientRequest() {
			@Override
			public ClientResponse execute(WebResource.Builder webResourceBuilder, Object request) {
				return webResourceBuilder.put(ClientResponse.class, request);
			}
		});
	}

	@Override
	public <T> T put(String url, Object request, Class<T> responseClass, AuthContext AuthContext) {
		return handleRequest(url, request, responseClass, AuthContext, new ClientRequest() {
			@Override
			public ClientResponse execute(WebResource.Builder webResourceBuilder, Object request) {
				return webResourceBuilder.put(ClientResponse.class, request);
			}
		});
	}
	@Override
	public <T> T post(String url, Object request, Class<T> responseClass, AuthContext AuthContext) {
		return handleRequest(url, request, responseClass, AuthContext, new ClientRequest() {
			@Override
			public ClientResponse execute(WebResource.Builder webResourceBuilder, Object request) {
				return webResourceBuilder.post(ClientResponse.class, request);
			}
		});
	}

	@SuppressWarnings("unchecked")
	@Override
	public <T> T post(String url, Object request, TypeReference<T> responseTypeReference,
			AuthContext AuthContext) {
		Class<?> responseType = getRawClass(responseTypeReference);
		return (T) post(url, request, responseType, AuthContext);
	}

	@Override
	public void post(String url, Object request, AuthContext AuthContext) {
		final Class<?> responseClass = null;
		handleRequest(url, request, responseClass, AuthContext, new ClientRequest() {
			@Override
			public ClientResponse execute(WebResource.Builder webResourceBuilder, Object request) {
				return webResourceBuilder.post(ClientResponse.class, request);
			}
		});
	}

	@Override
	public void delete(String url, AuthContext AuthContext) {
		final Object request = null;
		final Class<?> responseClass = null;
		handleRequest(url, request, responseClass, AuthContext, new ClientRequest() {
			@Override
			public ClientResponse execute(WebResource.Builder webResourceBuilder, Object request) {
				return webResourceBuilder.delete(ClientResponse.class);
			}
		});
	}

	@Override
	public void delete(String url, Object request, AuthContext AuthContext) {
		final Class<?> responseClass = null;
		handleRequest(url, request, responseClass, AuthContext, new ClientRequest() {
			@Override
			public ClientResponse execute(WebResource.Builder webResourceBuilder, Object request) {
				return webResourceBuilder.put(ClientResponse.class);
			}
		});
	}

	/**
	 * Builds Jersey's client object. 
	 * @return  com.sun.jersey.api.client.Client object
	 */
	private Client getClient() {
		if (this.applicationClient == null) {
			this.applicationClient = clientProvider.get();
		}
		return this.applicationClient;
	}

	
	private <T> Class<?> getRawClass(TypeReference<T> typeReference) {
		return TypeFactory.rawClass(typeReference.getType());
	}
	
}
