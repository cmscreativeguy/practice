
/**
 * @class CQ.form.CustomMultiField 
 * @extends CQ.form.CompositeField
* This is a custom path field with link text and target
* @param {Object} config the config object
*/

/**
* @class Ejst.CustomWidget
* @extends CQ.form.CompositeField
* This is a custom widget based on {@link CQ.form.CompositeField}.
* @constructor
* Creates a new CustomWidget.
* @param {Object} config The config object
*/

var hcounter = 1;
CQ.form.HeaderCustomMultiField = CQ.Ext.extend(CQ.form.CompositeField, {
 
/**
* @private
* @type CQ.Ext.form.TextField
*/
hiddenField: null,

/**
* @private
* @type CQ.Ext.form.TextField
*/
linkText: null,

/**
* @private
* @type CQ.Ext.form.TextField
*/
linkURL: null,

/**
* @private
* @type CQ.Ext.form.CheckBox
*/
openInNewWindow: null,

/**
* @private
* @type CQ.Ext.form.CheckBox
*/
isHideTextField: null,

/**
* @private
* @type CQ.Ext.form.FormPanel
*/
formPanel: null,
/**
* @private
* @type CQ.Ext.form.TextField
*/
fieldId : null,

constructor: function (config) {

config = config || {};

var defaults = {
    "border": true,
    "labelWidth": 75,
    "layout": "form"
    };    
config = CQ.Util.applyDefaults(config, defaults);
CQ.form.CustomMultiField.superclass.constructor.call(this, config);
},


//overriding CQ.Ext.Component#initComponent
initComponent: function () {
    
    CQ.form.CustomMultiField.superclass.initComponent.call(this);
    
    // Hidden field
    this.hiddenField = new CQ.Ext.form.Hidden({
         name: this.name
    });
    this.add(this.hiddenField);
   
    this.linkText = new CQ.Ext.form.TextField({
        cls: "customwidget-1",
        maxLength: 100,
        emptyText: "Enter Title",
        maxLengthText: "A maximum of 100 characters is allowed for the Link Text.",
        width: 335,
        allowBlank: true,
        name : "item",
        listeners: {
        change: {
        scope: this,
        fn: this.updateHidden
    }
    }
    });    
    this.add(this.linkText); 
       
    this.fieldId = new CQ.Ext.form.Hidden({
        cls: "customwidget-1",
        value : "Nav"+hcounter,
       
    }); 
    
    this.add(this.fieldId);
    hcounter = hcounter + 1;
    
    this.linkURL = new CQ.form.PathField({
        cls: "customwidget-2",
        allowBlank: true,
        emptyText: "Enter Title URL",
        width: 335,
        listeners: {
         change: {
            scope: this,
            fn: this.updateHidden
        },        
        dialogclose: {
            scope: this,
            fn: this.updateHidden
        }
       }
    });
    this.add(this.linkURL);
    
    // Link openInNewWindow
    this.openInNewWindow = new CQ.Ext.form.Checkbox({
        cls: "customwidget-3",
        boxLabel: "New window",
        listeners: {
        change: {
        scope: this,
        fn: this.updateHidden
        },
        check: {
        scope: this,
        fn: this.updateHidden
    }
    }
    });
    this.add(this.openInNewWindow);
    
    // isHideTextField
    this.isHideTextField = new CQ.Ext.form.Checkbox({
        cls: "customwidget-4",
        boxLabel: "Hide this Field",
        listeners: {
        change: {
            scope: this,
            fn: this.updateHidden
        },
        check: {
            scope: this,
            fn: this.updateHidden
        }
       }
    });
    this.add(this.isHideTextField);        
},

processInit: function (path, record) {
    
    this.linkText.processInit(path, record);
    this.linkURL.processInit(path, record);
    this.openInNewWindow.processInit(path, record);
    this.fieldId.processInit(path, record);
    this.isHideTextField.processInit(path, record);
},

setValue: function (value) {  
    var link = JSON.parse(value);
    this.linkText.setValue(link.text);
    this.linkURL.setValue(link.url);
    this.openInNewWindow.setValue(link.openInNewWindow);
    this.fieldId.setValue(link.fieldId);
    this.isHideTextField.setValue(link.isHideTextField); 
    this.hiddenField.setValue(value);  
},
getValue: function () {
return this.getRawValue();
},

getRawValue: function () {    
    var link = {
    "url": this.linkURL.getValue(),
    "text": this.linkText.getValue(),
    "openInNewWindow": this.openInNewWindow.getValue(),
    "isHideTextField": this.isHideTextField.getValue(),
    "fieldId": this.fieldId.getValue()
    };    
    return JSON.stringify(link);
},
updateHidden: function () {
this.hiddenField.setValue(this.getValue());

}
});

CQ.Ext.reg("HeaderCustomMultiField", CQ.form.HeaderCustomMultiField);