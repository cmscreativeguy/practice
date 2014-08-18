package com.sap.events.jersy.services.error;

public class ClientException extends RuntimeException {

	private static final long serialVersionUID = 5809313690706484398L;

	public ClientException() {
	}

	public ClientException(Throwable cause) {
		super(cause);
	}

	public String getErrorMessage() {
		return "Client exception";
	}

}
