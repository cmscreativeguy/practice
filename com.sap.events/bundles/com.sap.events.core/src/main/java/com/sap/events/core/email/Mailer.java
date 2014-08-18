package com.sap.events.core.email;

import javax.servlet.http.HttpServletRequest;

/**
 *  @author Ashok.Pelluru
 */
public interface Mailer {
  /**
   * Sends a mail to the configured user(s)
   * @param ex The exception to be mailed
   * @return 0 for success
   */
  public int send(HttpServletRequest req, Throwable ex);
}
