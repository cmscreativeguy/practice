package com.sap.events.core.email.impl;

import java.io.StringWriter;
import java.net.InetAddress;
import java.util.Date;
import java.util.Dictionary;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.mail.SimpleEmail;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.osgi.service.component.ComponentContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.day.cq.mailer.MailService;
import com.sap.events.core.email.Mailer;

@Component(metatype=false, immediate=true)
@Service
@Properties({
  @Property(name="com.sap.events.exception.recipients", value = {"cmscreativeguy@gmail.com"}),
  @Property(name="com.sap.events.exception.from", value = "cq5errors@sapvirtualevents.com"),
  @Property(name="service.description", value = "Mails exceptions to the configured user(s)"),
  @Property(name="service.vendor", value="SAP Virtual Events") })  
public class ExceptionMailerImpl implements Mailer{
  
  private static final Logger log = LoggerFactory.getLogger(ExceptionMailerImpl.class);
  
  public static final String PROP_RECIPIENTS = "com.sap.events.exception.recipients";
  public static final String PROP_FROM = "com.sap.events.exception.from";

  @Reference
  private MailService mailer;

  private static final String Separator = "\n-------------------------------\n";

  private String[] mailTo = null;
  private String from = null;

  @SuppressWarnings("rawtypes")
  protected void activate(ComponentContext context){
    Dictionary props = context.getProperties();

    this.mailTo = null;
    this.from = null;

    String from = (String) props.get(PROP_FROM);
    if(from != null){
      from = from.trim();
      if(!(from.equals("") || from.equals("~"))){
        this.from = from;
      }
    }

    String[] mailTo = (String[]) props.get(PROP_RECIPIENTS);
    if((mailTo != null) && (mailTo.length > 0)){
      for(int i=0; i<mailTo.length; i++){
        mailTo[i] = mailTo[i].trim();
      }
      this.mailTo = mailTo;
    }
  }

  protected void deactivate(ComponentContext context){
    this.mailTo = null;
    this.from = null;
  }

  public int send(HttpServletRequest req, Throwable ex){
    try{
      if(mailTo == null){
        log.info("--------------------------> Can't Mail because I don't see any 'To' addresses <-----------------------");		
        return 0;
      }
      StringWriter str = new StringWriter();
      SimpleEmail email = new SimpleEmail();

      if(this.from != null){
	    log.info("--------------------------> Setting FROM Addresss  <-----------------------" + this.from);
        email.setFrom(this.from);
      }

      for(String addr: mailTo){
        email.addTo(addr);
      }

      appendSummary(str, req, ex);
      appendRequestHeaders(str, req);
      appendStackTraces(str, ex);

      email.setSubject("[" + getHostName() + "]" + " - " + ex.toString());
      email.setMsg(str.toString());
      mailer.send(email);//sendEmail(email);
      return 0;
    }
    catch(Throwable oops){
	  log.error("--------------------------> Exception mailer threw an exception. Message follows  <-----------------------" + oops.getMessage());
      return 1;
    }
  }

  private void appendSummary(StringWriter str, HttpServletRequest req, Throwable ex){
    String tmp;
    str.write("Summary:" + Separator);
    str.write("Message: " + ex.getMessage() + "\n");
    str.write("Time: " + (new Date()).toString() + "\n");
    str.write("Request URI: " + req.getRequestURI() + "\n");
    str.write("Server: " + req.getServerName()+ ":" + req.getServerPort() + "\n");
    tmp = req.getQueryString();
    if(tmp != null)
      str.write("Query String: " + tmp + "\n");
  }

  @SuppressWarnings("rawtypes")
  private void appendRequestHeaders(StringWriter str, HttpServletRequest req){
    str.write(Separator +  "Request Headers:" + Separator);
    Enumeration names = req.getHeaderNames();
    while(names.hasMoreElements()){
      String name = (String)names.nextElement();
      if(safeToReport(name)){
        String value = req.getHeader(name);
        str.write(name);
        str.write(": ");
        str.write(value);
        str.write("\n");
      }
    }
  }

  private void appendStackTraces(StringWriter str, Throwable ex){
    str.write(Separator +  "Backtrace(s):" + Separator);

    appendStackTrace(str, ex);

    while((ex = ex.getCause()) != null) {
      str.write("\nCaused by: \n");
      str.write(ex.toString());
      str.write("\n\n");
      appendStackTrace(str, ex);
    }
  }

  private void appendStackTrace(StringWriter str, Throwable ex){
    StackTraceElement[] traceElements = ex.getStackTrace();
    for(StackTraceElement element: traceElements){
      str.write(element.toString());
      str.write("\n");
    }
  }

  private String getHostName(){
    String host = "Unknown host";
    try{
      InetAddress local = InetAddress.getLocalHost();
      host = local.getHostName();
    }
    catch(Throwable omg){
      log.error("--------------------------> Exception in getHostName <-----------------------" + omg.getMessage());
    }
    return host;
  }

  private boolean safeToReport(String name){
    name = name.toLowerCase();
    if(name.equals("authorization") || name.equals("proxy-authorization")){
      return false;
    }
    else{
      return true;
    }
  }
}