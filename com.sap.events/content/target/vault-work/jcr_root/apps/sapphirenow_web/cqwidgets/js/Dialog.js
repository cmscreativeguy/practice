/*
 * Copyright 1997-2008 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * @class CQ.Dialog
 * @extends CQ.Ext.Window
 * The Dialog is a special kind of window with a form in the body
 * and a button group in the footer. It is typically used to edit
 * content, but can also just display information.
 * @constructor
 * Creates a new Dialog.
 * @param {Object} config The config object
 */
function sleep(milliseconds) {
	var start = new Date().getTime();
	while ((new Date().getTime() - start) < milliseconds){
	// Do nothing
	}
}
CQ.Dialog = CQ.Ext.extend(CQ.Ext.Window, {
    /**
     * @cfg {String} okText
     * The text for the OK button (Defaults to "OK").
     */
    okText: null,

    /**
     * @cfg {String} cancelText
     * The text for the Cancel button (Defaults to "Cancel").
     */
    cancelText: null,

    /**
     * @cfg {Array/String} buttons
     * An array of {@link CQ.Ext.Button Button} configs, an array of strings,
     * or a single string. Strings may be {@link #Dialog.OK}, {@link #Dialog.CANCEL}, or
     * {@link #Dialog.OKCANCEL} (default).
     * <pre><code>
buttons: CQ.Dialog.OKCANCEL

buttons: [
    CQ.Dialog.CANCEL,
    {
        text: "Custom Button",
        handler: ...
    }
]
       </code></pre>
     */
    buttons: [],


    /**
     * @cfg {Object} params
     * A list of parameters to add to the dialog as hidden fields.
     * <p>Example:<pre><code>
params: {
    "paramName1": "value 1",
    "paramName2": "value 2"
}
       </code></pre></p>
     */
    params: {},

    /**
     * @cfg {CQ.Ext.Component} responseScope
     * The component to call the success or failure method on.
     */
    /**
     * @property {CQ.Ext.Component} responseScope
     * The component where the success or failure method is called on.
     */
    responseScope: null,

    /**
     * @cfg {Function} success
     * <p>The function to call if the dialog submission was successful.</p>
     * <p>By default, the success method of the {@link #responseScope} will
     * be called.</p>
     */
    success: null,

    /**
     * @cfg {Function} failure
     * <p>The function to call if the dialog submission has failed.</p>
     * <p>By default, the failure method of the {@link #responseScope} will
     * be called.</p>
     */
    failure: null,

    /**
     * @cfg {String} formUrl
     * The URL to submit the form data to.
     */
    formUrl: null,

    /**
     * @cfg {String} path
     * The path to load the content from.
     */
    /**
     * @property {String} path
     * The path content is loaded from.
     */
    path: null,

    /**
     * @cfg {String} helpPath
     * The path to open when the help button is clicked.
     */
    helpPath: null,

    /**
     * @cfg {Boolean} editLockMode
     * True to enable lock/unlock mode. Contained fields can be
     * enabled/disabled through a lock icon.
     */
    /**
     * @property {Boolean} editLockMode
     * True if lock/unlock mode is enabled
     */
    editLockMode: null,

    /**
     *
     * @cfg {Boolean} editLock
     * True to prohibit editing in this dialog.
     */
    /**
     * @property {Boolean} editLock
     * True if editing is prohibited.
     */
    editLock: null,

    /**
     * The form panel of the dialog.
     * @type CQ.Ext.form.FormPanel
     * @private
     */
    formPanel: null,

    /**
     * @property {CQ.Ext.form.BasicForm} form
     * The form of the dialog.
     */
    form: null,

    /**
     * True if the dialog title has been defined in the config.
     * @type Boolean
     * @private
     */
    titleFromConfig: false,

    /**
     * True if the URL of the form has been defined in the config.
     * @type Boolean
     * @private
     */
    formUrlFromConfig: false,

    /**
     * Object of default configs for the various item types.
     * @type Object
     * @private
     */
    configDefaults: null,

    /**
     * @property {Boolean} isPinned
     * True if the dialog is currently pinned.
     */
    isPinned: false,

    /**
     *
     * @cfg {Boolean} warnIfModified
     * Warn the user if the window is unloaded while this dialog is open
     * and fields are modified. Defaults to true.
     */
    warnIfModified: true,

    /**
     * @private
     * The values processed by the fields in {@link #processRecords}.
     */
    processedValues: null,

    /**
     * Sets the ID attribute of the underlying HTML element.
     * @private
     * @param {String} id The ID
     */
    setElId: function(id) {
        this.el.dom.id = id;
    },

    /**
     * Loads the content from the specified path or {@link CQ.Ext.data.Store Store}.
     * @param {String/CQ.Ext.data.Store} content The path or store
     * @param {String} extension The extension to add to the path for loading the dialog
     *                           (defaults to ".infinity.json")
     */
    loadContent: function(content, extension) {
        if (typeof(content) == "string") {
            this.path = content;
            var url = CQ.HTTP.externalize(this.path, true);

            extension = extension || CQ.Sling.SELECTOR_INFINITY + CQ.HTTP.EXTENSION_JSON;
            this.store = new CQ.data.SlingStore({"url": url + extension});

            if (!this.formUrlFromConfig) {
                // do a '/' request instead of a '/*' one.
                if (url.substring(url.length-2) == "/*") {
                    url = url.substring(0, url.length - 1);
                }
                this.form.url = url;
            }

            if (!this.titleFromConfig) {
                this.setTitle(url);
            }

            if(CQ.Ext.isIE6 && this.title && this.title.length > CQ.themes.Dialog.IE6_TITLE_MAX_CHAR) {
                this.setTitle(this.title.substring(0,CQ.themes.Dialog.IE6_TITLE_MAX_CHAR));
            }

        } else if (content instanceof CQ.Ext.data.Store) {
            this.store = content;
        }
        if (this.store) {
            this.store.load({
                callback: this.processRecords,
                scope: this
            });
        }
    },

    /**
     * Helper function to set the focus to the first field
     * of the Dialog. Called on 'show', 'loadContent'
     * (processRecords to be exact) and on 'tabChange'.
     * @private
     */
    focusFirstField: function(panel){
        if(!panel){
            panel = this.getActiveTab();
        }
        var fields = CQ.Util.findFormFields(panel);
        for (var f in fields){
            if(fields[f][0].focus){
                fields[f][0].focus(true, 400);
                break;
            }
        }
    },

    /**
     * Processes the specified records. This method should only be used as
     * a callback by the component's store when loading content.
     * @param {CQ.Ext.data.Record[]} recs The records
     * @param {Object} opts (optional) The options, such as the scope
     * @param {Boolean} success True if retrieval of records was
     *        successful
     * @private
     */
    processRecords: function(recs, opts, success) {
        var rec = this.getRecord(recs, success);

        CQ.Log.debug("CQ.Dialog#processRecords: processing records for fields");

        var isLiveCopy = false;
        var mixins = rec.get("jcr:mixinTypes");
        if (mixins && ((mixins.indexOf(CQ.wcm.msm.MSM.MIXIN_LIVE_RELATIONSHIP) != -1)
                || (mixins.indexOf(CQ.wcm.msm.MSM.MIXIN_LIVE_SYNC) != -1))) {
            isLiveCopy = true;
        }

        // remove existing BLOB markers which were added in previous calls to processRecords
        if (CQ.undo.UndoManager.isEnabled()) {
            CQ.undo.util.UndoUtils.removeBlobMarkerFields(this);
        }

        var fields = CQ.Util.findFormFields(this.formPanel);
        this.processedValues = {};
        for (var name in fields) {
            for (var i = 0; i < fields[name].length; i++) {
                try {
                    if (fields[name][i].processPath) {
                        CQ.Log.debug("CQ.Dialog#processRecords: calling processPath of field '{0}'", [name]);
                        fields[name][i].processPath(this.path, fields[name][i].initialConfig.ignoreData);
                    }
                    if (!fields[name][i].initialConfig.ignoreData) {
                        CQ.Log.debug("CQ.Dialog#processRecords: calling processRecord of field '{0}'", [name]);
                        fields[name][i].processRecord(rec, this.path);
                    }
                    if (!this.processedValues[name]) {
                        this.processedValues[name] = [];
                    }
                    this.processedValues[name].push({
                        "field":fields[name][i],
                        "value":fields[name][i].getValue()
                    });

                    if (this.fieldEditLockMode && isLiveCopy) {
                    	CQ.Log.debug("CQ.Dialog#processRecords: process fieldEditLock for field '{0}'", [name]);
                    	this.handleFieldLock(fields[name][i], rec);
                    }
                }
                catch (e) {
                    CQ.Log.debug("CQ.Dialog#processRecords: {0}", e.message);
                }
            }
        }

        // prepare creating an undo step from the current edit operation
        if (CQ.undo.UndoManager.isEnabled()) {
            var isUndoable = fields.hasOwnProperty("./sling:resourceType")
                    || fields.hasOwnProperty(CQ.undo.UndoDefs.UNDO_MARKER_FIELD);
            var uh = CQ.undo.UndoManager.getHistory();
            if (isUndoable) {
                uh.prepareUndo(new CQ.undo.util.OriginalData(this.path, rec, this));
            } else {
                uh.preventUndo();
            }
        }

        this.fireEvent("loadcontent", this, recs, opts, success);
        this.focusFirstField();
    },

    /**
     * TODO: document
     * @private
     * @param {String} rec The record
     */
    handleFieldLock: function(field, rec) {
    	if (field.getName().match("^\\./") != "./") {
            return; // only handle fields which store actual content,
                    // field name should start with ./
        }
    	var propName = field.getName().substr(field.getName().lastIndexOf("/") + 1);
        if (CQ.wcm.msm.MSM.isExcludedProperty(propName)) {
            return;
        }
        var fieldEditLock = true;
        var fieldEditLockDisabled = false;
        var iconCls = "cq-dialog-locked";

        // check if entire node is canceled
        var mixins = rec.get("jcr:mixinTypes");
        if (mixins
            && (mixins.indexOf(CQ.wcm.msm.MSM.MIXIN_LIVE_SYNC_CANCELLED) != -1)) {

            fieldEditLock = false;
            fieldEditLockDisabled = true;
            iconCls = "cq-dialog-unlocked";
        }

        // check if property inheritance is canceled
        if (rec.get(CQ.wcm.msm.MSM.PARAM_PROPERTY_INHERITANCE_CANCELED)) {
            var canceledProps = rec.get(CQ.wcm.msm.MSM.PARAM_PROPERTY_INHERITANCE_CANCELED);
            if (canceledProps.indexOf(propName) != -1) {
                fieldEditLock = false;
                iconCls = "cq-dialog-unlocked";
            }
        }

        field.editLock = fieldEditLock;

        // process field edit lock
        if (field.handleFieldLock) {
            field.handleFieldLock(iconCls, fieldEditLock, fieldEditLockDisabled, rec); // let field handle the rendering
        } else if (field.fieldEditLockBtn) {
            field.setDisabled(fieldEditLock);

            field.fieldEditLockBtn.setIconClass(iconCls);
            field.fieldEditLockBtn.setTooltip(iconCls == "cq-dialog-unlocked" ?
                    CQ.Dialog.REVERT_INHERITANCE : CQ.Dialog.CANCEL_INHERITANCE);
            field.fieldEditLockBtn.setDisabled(fieldEditLockDisabled);
        } else {
            var tip = "";
            if (fieldEditLockDisabled) tip = CQ.Dialog.INHERITANCE_BROKEN;
            else tip = fieldEditLock ? CQ.Dialog.CANCEL_INHERITANCE : CQ.Dialog.REVERT_INHERITANCE;
            try {
                field.setDisabled(fieldEditLock);
                var dlg = this;
                field.fieldEditLockBtn = new CQ.TextButton({
                    "disabled":fieldEditLockDisabled,
                    "tooltip":tip,
                    "cls":"cq-dialog-editlock",
                    "iconCls":iconCls,
                    "handleMouseEvents": false,
                    "handler": function() {
                    dlg.switchPropertyInheritance(field,
                            propName,
                            function(iconCls, editLock) {
                            field.fieldEditLockBtn.setIconClass(iconCls);
                            field.fieldEditLockBtn.setTooltip(iconCls == "cq-dialog-unlocked" ?
                                    CQ.Dialog.REVERT_INHERITANCE : CQ.Dialog.CANCEL_INHERITANCE);
                            field.setDisabled(editLock);
                            field.editLock = editLock;
                            },
                            dlg);
                    }
                });
                var formEl = CQ.Ext.get('x-form-el-' + field.id);
                var label = formEl.parent().first();
                // narrow the field label
                formEl.parent().first().dom.style.width =
                        (parseInt(label.dom.style.width) - CQ.themes.Dialog.LOCK_WIDTH) + "px";
                if (field.rendered) {
                    field.fieldEditLockBtn.render(formEl.parent(), label.next());
                } else {
                    this.on("render", function(comp) {
                        field.fieldEditLockBtn.render(formEl.parent(), label.next());
                    });
                }
            }
            catch (e) {
                // skip (formEl is null)
            }
        }
    },

    switchPropertyInheritance: function(field, propName, callback, scope) {
        CQ.Ext.Msg.confirm(
            field.editLock ? CQ.I18n.getMessage("Cancel inheritance") : CQ.I18n.getMessage("Revert inheritance"),
            field.editLock ? CQ.I18n.getMessage("Do you really want to cancel the inheritance?") : CQ.I18n.getMessage("Do you really want to revert the inheritance?"),
            function(btnId) {
                if (btnId == "yes") {
                    var editLock = false;
                    var iconCls = "cq-dialog-unlocked";

                    // build parameters
                    var params = {};
                    params[ "cmd" ] = "cancelPropertyInheritance";
                    if( !field.editLock ) {
                        var editLock = true;
                        var iconCls = "cq-dialog-locked";

                        params[ "cmd" ] = "reenablePropertyInheritance";
                    }
                    params[ CQ.wcm.msm.MSM.PARAM_PROPERTY_NAME ] = [];
                    if (field.getFieldLockParameters) {
                    	params = field.getFieldLockParameters(params);
                    } else {
                    	params[ CQ.wcm.msm.MSM.PARAM_PROPERTY_NAME ].push(propName)
                    }
                    // define filed lock target
                    var dlg = this; // scope should be dialog
                    var path = dlg.path;
                    if (field.getFieldLockTarget) {
                    	path = field.getFieldLockTarget(path);
                    }

                    var serverResponse = CQ.utils.HTTP.post(path + ".msm.conf", null, params, this);
                    if (CQ.utils.HTTP.isOk(serverResponse)) {
                        if (callback) {
                            callback.call(field, iconCls, editLock);
                        }
                        if (editLock) {
                            dlg.store.reload({
                                callback:function(recs, opts, success) {
                                    var rec = dlg.getRecord(recs, success);
                                    field.processRecord(rec, dlg.path);

                                    // default is only applied when resource unmodified
                                    if (!rec.get(propName)
                                        && (field.getValue() != field.defaultValue)) {
                                        field.setValue(null);
                                    }
                                }
                            });
                        }
                    }
                }
            },
            scope || this
        );
    },

    /**
     * TODO: document
     * @private
     * @param {String} path The path
     */
    getRecord: function(recs, success) {
    	var rec;
    	if (success && this.path.charAt(this.path.length - 1) != "/" &&
            this.path.charAt(this.path.length - 1) != "*") {
            rec = recs[0];
        } else {
            if (!success) {
                CQ.Log.warn("CQ.Dialog#processRecords: retrieval of records unsuccessful");
            } else {
                CQ.Log.info("CQ.Dialog#processRecords: skipping paths ending in '/' or /*'");
            }
            rec = new CQ.data.SlingRecord();
            rec.data = {};
        }
    	return rec;
    },

    /**
     * TODO: document
     * @private
     * @param {String} path The path
     */
    processPath: function(path) {
        CQ.Log.debug("CQ.Dialog#processPath: processing path for fields");
        var fields = CQ.Util.findFormFields(this.formPanel);
        for (var name in fields) {
            for (var i = 0; i < fields[name].length; i++) {
                try {
                    if (fields[name][i].processPath) {
                        CQ.Log.debug("CQ.Dialog#processPath: field '{0}'", [name]);
                        fields[name][i].processPath(path);
                    }
                }
                catch (e) {
                    CQ.Log.debug("CQ.Dialog#processPath: {0}", e.message);
                }
            }
        }
    },

    /**
     * Method to add multiple name/value pairs as hidden fields. Format:
     * <pre><code>
{
    "hidden1Name": "hidden1Value",
    "hidden2Name": "hidden2Value"
}
       </code></pre>
     * @param {Object} params The names and values for the hidden fields
     * @param {Boolean} ignoreData (optional) False to process data on {@link #loadContent}. Defaults to true. (since 5.4)
     * @return {Object} The created hidden fields in an object (since 5.4)
     * <pre><code>
{
    "hidden1Name": {CQ.Ext.form.Hidden},
    "hidden2Name": {CQ.Ext.form.Hidden}
}
       </code></pre>
     */
    addHidden: function(params, ignoreData) {
        for (var name in params) {
            var hidden = CQ.Util.build({
                "xtype": "hidden",
                "name": name,
                "value": params[name],
                "ignoreData": ignoreData !== false
            });
            this.formPanel.add(hidden);
            params[name] = hidden;
        }
        this.formPanel.doLayout();
        return params;
    },

    /**
     * Method to add multiple name/value pairs as hidden fields. Each field is
     * added only if no field of the same name already exists.
     * Format:
     * <pre><code>
{
    "param1Name": "param1Value",
    "param2Name": "param2Value"
}
       </code></pre>
     * @param {Object} params The names and values for the hidden fields
     * @param {Boolean} ignoreData (optional) False to process data on {@link #loadContent}. Defaults to true. (since 5.4)
     */
    addParams: function(params, ignoreData) {
        var cleaned = {};
        var fields = CQ.Util.findFormFields(this.formPanel);
        for (var name in params) {
            if (!fields[name]) {
                cleaned[name] = params[name];
            }
        }
        this.addHidden(cleaned, ignoreData);
    },

    /**
     * Returns the fields with the specified name. If there are multiple fields
     * with the same name, an array of these fields is returned.
     * @param {String} name The name of the field
     * @return {Field/Field[]} The field or array of fields
     */
    getField: function(name) {
        var fields = CQ.Util.findFormFields(this.formPanel);
        if (fields[name] && fields[name].length == 1) return fields[name][0];
        else return fields[name];
    },

    /**
     * Enables all fields in the dialog.
     * @since 5.3
     */
    enableFields: function() {
        var fields = CQ.Util.findFormFields(this.formPanel);
        for (var name in fields) {
            for (var i = 0; i < fields[name].length; i++) {
                var field = fields[name][i];
                if (field)
                    if (field.enable) {
                        field.enable();
                    }
            }
        }
    },

    /**
     * Disables all fields in the dialog.
     * @since 5.3
     */
    disableFields: function() {
        var fields = CQ.Util.findFormFields(this.formPanel);
        for (var name in fields) {
            for (var i = 0; i < fields[name].length; i++) {
                var field = fields[name][i];
                if (field)
                    if (field.disable) {
                        field.disable();
                    }
            }
        }
    },

    /**
     * Applies the given defaults to the given config object if config is of
     * of the given xtype. Otherwise the config object is returned unchanged.
     * @param {Object} config The config object
     * @param {Object} defaults The defaults
     * @private
     */
    applySingleConfigDefaults: function(config, defaults, xtype) {
        var partConfig = CQ.Util.getSingleItemConfig(config, xtype);
        if (partConfig) {
            return CQ.Util.applyDefaults(partConfig, defaults);
        }
        return config;
    },

    /**
     * Applies the given defaults to the given config object.
     * @param {Object} config The config object
     * @param {Object} defaults The defaults
     * @private
     */
    applyConfigDefaults: function(config, defaults) {

        CQ.Util.applyDefaults(config, defaults["dialog"]);

        if (config["items"].xtype == "tabpanel") {
            var tabPanel = this.applySingleConfigDefaults(config, defaults["tabpanel"], "tabpanel");
            if (tabPanel && tabPanel.items) {
                if (tabPanel.items instanceof Array) {
                    // multiple tab pages
                    for (var i = 0; i < tabPanel.items.length; i++) {
                        var tab = CQ.Util.applyDefaults(tabPanel.items[i], defaults["panel"]);
                    }
                }
                else {
                    // single tab page
                    var tab = CQ.Util.applyDefaults(tabPanel.items, defaults["panel"]);
                }
            }
        }
        else {
            // single panel (without a tab panel)
            var singlePanel = this.applySingleConfigDefaults(config, defaults["panel"], "panel");
        }

        if (config["buttons"]) {
            if (typeof config["buttons"] == "string") {
                // buttons: CQ.Dialog.OK  =>  buttons: [CQ.Dialog.OK]
                config["buttons"] = [config["buttons"]];
            }
            var buttons = [];

            if(config["editLockMode"]) {
                config["buttonAlign"] = "left";

                var cls, tip;
                if(config["editLock"]) {
                    cls = "cq-dialog-locked";
                    tip = CQ.I18n.getMessage("Cancel inheritance");
                }
                else {
                    cls = "cq-dialog-unlocked";
                    tip = CQ.I18n.getMessage("Revert inheritance");
                }

                var dlg = this;

                var cfg = {
                    "iconCls": cls,
                    "cls": "cq-dialog-editlock",
                    "tooltip": tip,
                    "enableToggle": true,
                    "handleMouseEvents": false,
                    "toggleHandler": function(button) {
                        if( dlg.editLock ) {
                            dlg.enableFields(dlg.formPanel);
                            button.setIconClass("cq-dialog-unlocked");
                            button.setTooltip(CQ.Dialog.REVERT_INHERITANCE);
                            dlg.fireEvent("beforeeditunlocked",dlg);
                        } else {
                            dlg.disableFields(dlg.formPanel);
                            button.setIconClass("cq-dialog-locked");
                            button.setTooltip(CQ.Dialog.CANCEL_INHERITANCE);
                            dlg.fireEvent("beforeeditlocked",dlg);
                        }
                    }
                };
                if( config["editLockDisabled"] === true || config["editLockDisabled"] == "true" ) {
                    cfg["disabled"] = true;
                    cfg["tooltip"] = config["editLockDisabledTitle"];
                }
                buttons.push(cfg);
            }

            // Generate the help button, see bug #20030
            if (config.params) {
                var dialogType = config.params["./sling:resourceType"];
                if (dialogType && config.helpPath) {
                    buttons.push(CQ.Util.applyDefaults(
                            CQ.wcm.HelpBrowser.createHelpButton(config.helpPath),
                            defaults["button"]));
                }
            }
            for (var i=0; i < config["buttons"].length; i++) {
                if (typeof config["buttons"][i] == "string") {
                    if (config["buttons"][i] == CQ.Dialog.OK) {

                        var okButton = this.getOkConfig();
                        buttons.push(CQ.Util.applyDefaults(okButton, defaults["button"]));
                    }
                    if (config["buttons"][i] == CQ.Dialog.CANCEL) {

                        var cancelButton = this.getCancelConfig();
                        buttons.push(CQ.Util.applyDefaults(cancelButton, defaults["button"]));
                    }
                    if (config["buttons"][i] == "-" || config["buttons"][i] == "->") {
                        buttons.push(config["buttons"][i]);
                    }
                }
                else {
                    if(config["buttons"][i]) {
                        if (typeof config["buttons"][i].handler == "string") {
                            config["buttons"][i].handler = eval(config["buttons"][i].handler);
                        }
                        if (config["buttons"][i].menu) {
                            CQ.Util.applyDefaults(config["buttons"][i].menu, defaults["menu"]);
                        }
                        buttons.push(CQ.Util.applyDefaults(config["buttons"][i], defaults["button"]));
                    }
                }
            }
            config["buttons"] = buttons;
        }
    },

    /**
     * Returns the config for the default OK button.
     * @private
     * @return {Object} The config for the default OK button
     */
    getOkConfig: function() {
        return {
            text: this.okText,
            cls: "cq-btn-ok",
            handler: function(button) {
                // scope: "this" is a dialog instance
            	var dailogInstance = this;
            	if(clickActions.length > 0){   
            		CQ.Ext.Msg.alert(
                			CQ.I18n.getMessage('Processing'),
                            CQ.I18n.getMessage("Please wait...")
                        );
            		jQuery.ajax({
            	        url: "/bin/changenodes",
            	        type: "POST",
            	        data: JSON.stringify(clickActions),
            	        contentType: 'application/json; charset=utf-8',
            	        dataType: "json",
            	        success: function(options, success, xhr) {
            	        	dailogInstance.ok(button);
            	        }                              
            	      });		
        		}else{
        			dailogInstance.ok(button);
        		}
            }
        };
    },

    /**
     * Returns the config for the default cancel button.
     * @private
     * @return {Object} The config for the default Cancel button
     */
    getCancelConfig: function() {
        return {
            text: this.cancelText,
            cls: "cq-btn-cancel",
            handler: function(button) {
                // Cancel undo
                if (CQ.undo.UndoManager.isEnabled()) {
                    CQ.undo.UndoManager.getHistory().cancelUndo();
                    clickActions = [];
                }
                clickActions = [];
                // scope: "this" is a dialog instance
                this[this.closeAction]();
            }
        };
    },

    /**
     * Returns the dialog's active tab in case a {@link CQ.Ext.TabPanel TabPanel}
     * is present, or the inner panel.
     * @return {CQ.Ext.Panel} The active tab or inner panel
     */
    getActiveTab: function() {
        var panel = this.formPanel.getComponent(0).getComponent(0);
        if (panel.xtype == "tabpanel") {
            panel = panel.getActiveTab();
        }
        return panel;
    },

    /**
     * Sets the URL to submit the form data to.
     * @param {String} url The URL
     * @since 5.4
     */
    setFormUrl: function(url) {
        this.form.url = url;
    },
    
    callHeaderNavigation: function(){
    	jQuery.ajax({
	        url: "/bin/changenodes",
	        type: 'POST',
	        data: JSON.stringify(clickActions),
	        contentType: 'application/json; charset=utf-8',
	        dataType: "json",
	        success: function(response) {
	        },
	        failure: function() {
	        }                                 
	      });
    },

    /**
     * Submits the dialog.
     * @param {CQ.Ext.Button} button The button that has been hit
     * @param {Function} success The function to call if the dialog submission was successful.
     *                           Overwrites {@link #success}.
     * @param {Function} failure The function to call if the dialog submission has failed.
     *                           Overwrites {@link #failure}.
     */
    ok: function(button, success, failure) {
    	var config = {};
        var rsSuccess;
        var rsFailure;
        
        if (this.responseScope) {
            config.scope = this.responseScope;
            rsSuccess = this.responseScope.success;
            rsFailure = this.responseScope.failure;
        }
        config.success = success ? success : this.success ? this.success : rsSuccess;
        config.failure = failure ? failure : this.failure ? this.failure : rsFailure;

        if (this.form.isValid()) {
            if (this.fireEvent("beforesubmit", this) === false){
                return false;
            }
            this.form.items.each(function(field) {
                // clear fields with emptyText so emptyText is not submitted
                if (field.emptyText && field.el && field.el.dom && field.el.dom.value == field.emptyText) {
                    field.setRawValue("");
                }
            });
            var action = new CQ.form.SlingSubmitAction(this.form, config);
            this.form.doAction(action);
            this[this.closeAction]();
        } else {
            CQ.Ext.Msg.show({
                title:CQ.I18n.getMessage('Validation Failed'),
                msg: CQ.I18n.getMessage('Verify the values of the marked fields.'),
                buttons: CQ.Ext.Msg.OK,
                icon: CQ.Ext.Msg.ERROR
            });
        }
     },

    /**
     * Keeps the dialog at its current position on the screen,
     * repositioning it when the document gets scrolled to achieve
     * the impression that it is actually pinned to the screen.
     * Optionally, one of the following alignments may be used
     * to position the dialog:
     * <ul>
     *   <li><code>tl</code> top-left</li>
     *   <li><code>tr</code> top-right</li>
     *   <li><code>c</code> center</li>
     *   <li><code>bl</code> bottom-left</li>
     *   <li><code>br</code> bottom-right</li>
     * </ul>
     * @param {String} align The alignment
     */
    pin: function(align) {
        this.alignToViewport(align);
        if (!this.isPinned) {
            CQ.Util.pin(this);
            this.isPinned = true;
        }
    },

    /**
     * Removes the pin from the dialog, letting it scroll with the
     * document again.
     */
    unpin: function() {
        if (this.isPinned) {
            CQ.Util.unpin(this);
            this.isPinned = false;
        }
    },

    /**
     * Positions the dialog on the screen.
     * One of the following alignments may be used:
     * <ul>
     *   <li><code>tl</code> top-left</li>
     *   <li><code>tr</code> top-right</li>
     *   <li><code>c</code> center</li>
     *   <li><code>bl</code> bottom-left</li>
     *   <li><code>br</code> bottom-right</li>
     * </ul>
     * @param {String} align The alignment
     */
    alignToViewport: function(align) {
        if (!align) return;
        var x, y = 0;
        var vpw = CQ.Ext.lib.Dom.getViewportWidth();
        var vph = CQ.Ext.lib.Dom.getViewportHeight();
        var offx = CQ.themes.Dialog.CORNER_X;
        var offy = CQ.themes.Dialog.CORNER_Y;
        var box = this.getBox();
        switch (align) {
            case "tl":
                x = offx;
                y = offy;
                break;
            case "tr":
                x = vpw - box.width - offx;
                y = offy;
                break;
            case "bl":
                x = offx;
                y = vph - box.height - offx;
                break;
            case "br":
                x = vpw - box.width - offx;
                y = vph - box.height - offy;
                break;
            case "c":
            default:
                var center = this.getEl().getCenterXY();
                x = center[0];
                y = center[1];
        }
        this.setPosition(x,y);
    },

    /**
     * Overrides the current position of the dialog before it is shown,
     * taking the scrolling offsets of the document into account.
     * @private
     */
    overridePosition: function() {
        if( !this.disableOverridePosition ) {
            var scroll = CQ.Ext.getDoc().getScroll();
            if (this.x) {
                this.originalX = this.x;
                this.x += scroll.left;
            }
            if (this.y) {
                this.originalY = this.y;
                this.y += scroll.top;
            }
        }
    },

    /**
     * Resets the position of the dialog after it has been hidden.
     * @private
     */
    resetPosition: function() {
        if (this.originalX) this.x = this.originalX;
        if (this.originalY) this.y = this.originalY;
    },

    constructor: function(config) {
        if (config.header===false || config.title) {
            this.titleFromConfig = true;
        }

        this.okText = config.okText ? config.okText : CQ.I18n.getMessage("OK");
        this.cancelText = config.cancelText ? config.cancelText : CQ.I18n.getMessage("Cancel");

        this.configDefaults = {
            "dialog": {
                xtype: "dialog",
                closable: true,
                closeAction: "hide",
                width: CQ.themes.Dialog.WIDTH,
                height: CQ.themes.Dialog.HEIGHT,
                minWidth: CQ.themes.Dialog.MIN_WIDTH,
                minHeight: CQ.themes.Dialog.MIN_HEIGHT,
                y:20,
                title: "&nbsp;",
                layout: "fit",
                plain: CQ.themes.Dialog.PLAIN,
                bodyStyle: CQ.themes.Dialog.BODY_STYLE,
                buttonAlign: CQ.themes.Dialog.BUTTON_ALIGN,
                minButtonWidth: CQ.themes.Dialog.MIN_BUTTON_WIDTH,
                "stateful": false,
                "disableOverridePosition": false
            },
            "tabpanel": {
                xtype: "tabpanel",
                activeTab:0,
                // todo: setValue does not work if deferredRender == true
                deferredRender: false,
                plain: CQ.themes.Dialog.TABPANEL_PLAIN,
                border: CQ.themes.Dialog.TABPANEL_BORDER,
                "enableTabScroll":true,
                "stateful": false,
                "listeners": {
                    "tabchange": {
                        "fn": function(tabPanel, tab) {
                            if(tabPanel.rendered){
                                // IE needs to hide & show the tab in order to
                                // correctly render form fields
                                if (CQ.Ext.isIE) {
                                    tab.hide();
                                    tab.show();
                                }
                                this.focusFirstField(tab);
                            }
                        },
                        "scope": this
                    }
                }
            },
            "panel": {
                layout: "form",
                autoScroll: true,
                bodyStyle: CQ.themes.Dialog.TAB_BODY_STYLE,
                labelWidth: CQ.themes.Dialog.LABEL_WIDTH,
                defaultType: "textfield",
                "stateful": false,
                defaults: {
                    msgTarget: CQ.themes.Dialog.MSG_TARGET,
                    anchor: CQ.themes.Dialog.ANCHOR,
                    "stateful": false
                }
            },
            "button": {
                xtype: "button",
                scope: this
            },
            "menu": {
                defaults: {
                    scope: this
                }
            }

            //todo: defaults for different field types
//            "textarea": {
//
//            }
        };
        this.applyConfigDefaults(config, this.configDefaults);
        CQ.Dialog.superclass.constructor.call(this, config);
        var formConfig = {
            xtype: "form",
            renderTo: CQ.Util.ROOT_ID,
            baseCls: "x-window-plain",
            items: this
        };
        if (this.fileUpload) {
            formConfig.fileUpload = this.fileUpload;
        }
        this.formPanel = new CQ.Ext.form.FormPanel(formConfig);
        this.form = this.formPanel.getForm();

        if (config.formUrl) {
            this.form.url = config.formUrl;
            this.formUrlFromConfig = true;
        }

        if (!config.params) {
            config.params = new Object();
        }
        if (config.params[CQ.Sling.CHARSET] == undefined) {
            config.params[CQ.Sling.CHARSET] = CQ.Dialog.DEFAULT_ENCODING;
        }
        if (config.params[CQ.Sling.STATUS] == undefined) {
            config.params[CQ.Sling.STATUS] = CQ.Sling.STATUS_BROWSER;
        }

        this.addParams(config.params);

        if (config.content) {
            this.loadContent(config.content);
        }

        this.success = config.success;
        this.failure = config.failure;
        this.responseScope = config.responseScope;

        this.on("beforeshow", this.overridePosition);
        //todo: #21270 - Usability: Accept enter key as submit
//        this.on("beforeshow", function(dialog) {
//            // add key listener to submit dialog when enter is pressed
//            var fields = CQ.Util.findFormFields(this.formPanel);
//            for (var f in fields) {
//                fields[f][0].on("specialkey", function(field, e) {
//                    if (e.getKey() == e.ENTER) {
//                        dialog.ok();
//                    }
//                });
//            }
//        }, this, { single: true });

        this.on("hide", this.resetPosition);
        this.on("show", function(dialog) {
            dialog.focusFirstField();
        });

        // add events
        this.addEvents(
            /**
             * @event beforesubmit
             * Fires before a the dialog is submitted. Return false to
             * cancel the submission.
             * @param {CQ.Dialog} this
             */
            "beforesubmit",
            /**
             * @event loadContent
             * Fires after the dialog's content has been loaded.
             * @param {CQ.Dialog} this
             * @deprecated Use {@link CQ.Dialog#loadcontent loadcontent} instead
             */
            "loadContent",
            /**
             * @event loadcontent
             * Fires after the dialog's content has been loaded.
             * @param {CQ.Dialog} this
             * @param {CQ.Ext.data.Record[]} recs The records
             * @param {Object} opts The options, such as the scope
             * @param {Boolean} success True if retrieval of records was
             *        successful
             * @since 5.3
             */
            "loadcontent",
            /**
             * @event beforeeditlocked
             * Fires before the dialog gets locked. Note that the user may cancel
             * locking the dialog after the event has been fired.
             * @param {CQ.Dialog} this
             * @since 5.4
             */
            "beforeeditlocked",
            /**
             * @event editLocked
             * Fires after the dialog has been locked. Note that the user may cancel
             * locking the dialog after the event has been fired.
             * @param {CQ.Dialog} this
             * @deprecated Use {@link CQ.Dialog#editlocked editlocked} instead
             */
            "editLocked",
            /**
             * @event editlocked
             * Fires after the dialog has been locked.
             * @param {CQ.Dialog} this
             * @param {Boolean} True if the event is representing the current state of the
             *        component; false if the event is representing a change by the user;
             *        parameter available as of CQ 5.4
             * @since 5.3
             */
            "editlocked",
            /**
             * @event beforeeditunlocked
             * Fires before the dialog gets unlocked. Note that the user may cancel
             * unlocking the dialog after the event has been fired.
             * @param {CQ.Dialog} this
             * @since 5.4
             */
            "beforeeditunlocked",
            /**
             * @event editUnlocked
             * Fires after the dialog has been unlocked. Note that the user may cancel
             * unlocking the dialog after the event has been fired.
             * @param {CQ.Dialog} this
             * @deprecated Use {@link CQ.Dialog#editunlocked editunlocked} instead
             */
            "editUnlocked",
            /**
             * @event editunlocked
             * Fires after the dialog has been unlocked. Note that the user may cancel
             * unlocking the dialog after the event has been fired.
             * @param {CQ.Dialog} this
             * @param {Boolean} True if the event is representing the current state of the
             *        component; false if the event is representing a change by the user;
             *        parameter available as of CQ 5.4
             * @since 5.3
             */
            "editunlocked"
        );

        if (this.warnIfModified) {
            if (!window.CQ_Dialog_checkBeforeUnload) {
                window.CQ_Dialog_checkBeforeUnload = [];
                window.onbeforeunload = CQ.Dialog.checkModified;
                //cleanup event
                CQ.Ext.EventManager.addListener(window,"unload", function() {
                    window.CQ_Dialog_checkBeforeUnload = null;
                    window.onbeforeunload = null;
                });
            }
            window.CQ_Dialog_checkBeforeUnload.push(this);
        }
    },

    /**
     * Called by observer. Checks if each element is correctly anchored or
     * aligned to its placeholder.
     * @private
     * @see CQ.utils.Util#observeComponent
     * @see CQ.utils.Util#runComponentObservation
     */
    observe: function() {
        if(!this.hidden) {
            if (this.anchoredTo) {
                var inlinePlaceholder = this.anchoredTo.getInlinePlaceholder();
                if(inlinePlaceholder) {
                    var inlinePlaceholderIntialHeight = this.anchoredTo.getInlinePlaceholderInitialHeight();

                    var windowXY = this.getPosition();
                    var placeholderXY = inlinePlaceholder.getXY();
                    if(windowXY[0]!=placeholderXY[0] || windowXY[1] != placeholderXY[1] + inlinePlaceholderIntialHeight) {
                        this.alignTo(inlinePlaceholder,"tl", [0, inlinePlaceholderIntialHeight]);
                    }
                }
            }
        }
    },

    initComponent: function() {
        CQ.Dialog.superclass.initComponent.call(this);

        if (this.editLockMode) {
            this.editLockButton = this.buttons[0];

            this.on("show", function() {
                this.setEditLock(this.editLock, true, true);
            }, this);
        }
    },

    setEditLock: function(newEditLock, isInitialState, fireEvent) {
        if( newEditLock ) {
            this.disableFields();
            this.editLockButton.setIconClass("cq-dialog-locked");
            this.editLockButton.setTooltip(CQ.Dialog.CANCEL_INHERITANCE);
        } else {
            this.enableFields();
            this.editLockButton.setIconClass("cq-dialog-unlocked");
            this.editLockButton.setTooltip(CQ.Dialog.REVERT_INHERITANCE);
        }

        this.editLock = newEditLock;
        if (fireEvent) {
            this.fireEvent((this.editLock ? "editlocked" : "editunlocked"), this,
                    isInitialState);
        }
    }
});

/**
 * Checks if any open dialogs have modified fields and warns the user
 * before leaving the page if necessary.
 * @static
 * @private
 */
CQ.Dialog.checkModified = function() {
    if (this.CQ_Dialog_checkBeforeUnload) {
        for (var d = 0; d < this.CQ_Dialog_checkBeforeUnload.length; d++) {
            var dialog = this.CQ_Dialog_checkBeforeUnload[d];
            if (!dialog.hidden && dialog.processedValues) {
                for (var name in dialog.processedValues) {
                    for (var i = 0; i < dialog.processedValues[name].length; i++) {
                        var field = dialog.processedValues[name][i].field;
                        var value = dialog.processedValues[name][i].value;
                        if (CQ.Util.compareValues(field.getValue(), value) != 0) {
                            return CQ.I18n.getMessage("There are unsaved changes in the currently open dialog(s)");
                        }
                    }
                }
            }
        }
    }
};

/**
 * The default encoding (UTF-8).
 * @static
 * @final
 * @type String
 */
CQ.Dialog.DEFAULT_ENCODING = "utf-8";

/**
 * The value for {@link #buttons} to create an OK button.
 * @static
 * @final
 * @type String
 */
CQ.Dialog.OK = "OK";

/**
 * The value for {@link #buttons} to create a Cancel button.
 * @static
 * @final
 * @type String
 */
CQ.Dialog.CANCEL = "CANCEL";

/**
 * The value for {@link #buttons} to create an OK and Cancel button group.
 * @static
 * @final
 * @type String
 */
CQ.Dialog.OKCANCEL = [
    CQ.Dialog.OK,
    CQ.Dialog.CANCEL
];

/**
 * The tool tip for the edit lock button to cancel inheritance.
 * @static
 * @final
 * @type String
 */
CQ.Dialog.CANCEL_INHERITANCE = CQ.I18n.getMessage("Cancel inheritance");

/**
 * The tool tip for the edit lock button to revert inheritance.
 * @static
 * @final
 * @type String
 */
CQ.Dialog.REVERT_INHERITANCE = CQ.I18n.getMessage("Revert inheritance");

/**
 * The tool tip for the edit lock button when inheritance is broken at page level.
 * @static
 * @final
 * @type String
 */
CQ.Dialog.INHERITANCE_BROKEN = CQ.I18n.getMessage("Inheritance is broken at the page level");


CQ.Ext.reg("dialog", CQ.Dialog);