package com.sap.events.jersy.services.error;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ErrorClass {

	EXCEPTION_FAULT("ExceptionFault"), //
	EXTERNAL_COMPONENT_EXCEPTION("ExternalComponentException"), //
	VALIDATION_FAILED_EXCEPTION("ValidationFailedException"), //
	UNRECOGNISED_ERROR_CLASS("UnrecognisedErrorClass"), //	
	INVALID_SECRET("ChangeSecretTheSecretYouHaveEnteredIsNotAllowed");

	private final String name;

	private ErrorClass(String name) {
		this.name = name;
	}

	@JsonValue
	public String value() {
		return name;
	}

	@JsonCreator
	public static ErrorClass fromString(String name) {
		for (ErrorClass errorClass : ErrorClass.values()) {
			if (errorClass.name.equals(name)) {
				return errorClass;
			}
		}

		return UNRECOGNISED_ERROR_CLASS;
	}
}
