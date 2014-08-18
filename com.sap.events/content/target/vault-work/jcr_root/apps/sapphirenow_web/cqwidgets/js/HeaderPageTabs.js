

var counter = 1;

CQ.form.HeaderPageTabs = CQ.Ext.extend(CQ.form.CompositeField, {
 

hiddenField: null,

linkText: null,

pageHighlight: null,

/**
* @private
* @type CQ.Ext.form.TextField
*/
linkURL: null,

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
    
    // Link text
    this.add(new CQ.Ext.form.Label({
    cls: "customwidget-label"
    }));

    this.linkText = new CQ.Ext.form.TextField({
        cls: "customwidget-1",
        emptyText: "Enter Title",
        width: 335,
        allowBlank: true,
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
        value : counter,       
    }); 
    //alert("jjjj :"+counter);
    this.add(this.fieldId);
    counter = counter + 1;
    
    
// Link URL
this.add(new CQ.Ext.form.Label({
    cls: "customwidget-label"
}));

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

this.pageHighlight = new CQ.Ext.form.Checkbox({
    cls: "customwidget-3",
    boxLabel: "Enable this tab",
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
this.add(this.pageHighlight);

},

processInit: function (path, record) {
    this.linkText.processInit(path, record);
    this.linkURL.processInit(path, record);
    this.pageHighlight.processInit(path, record);
    this.fieldId.processInit(path, record);    
},

setValue: function (value) {
    var link = JSON.parse(value);
    this.linkText.setValue(link.text);
    this.linkURL.setValue(link.url);    
    this.pageHighlight.setValue(link.pageHighlight);
    this.fieldId.setValue(link.fieldId); 
    this.hiddenField.setValue(value);       
},

getValue: function () {
return this.getRawValue();
},

getRawValue: function () {
    var link = {   
    "text": this.linkText.getValue(),
    "url": this.linkURL.getValue(),
    "pageHighlight": this.pageHighlight.getValue(),
     "fieldId": this.fieldId.getValue()
    };
    return JSON.stringify(link);
},

updateHidden: function () {
this.hiddenField.setValue(this.getValue());
}

});

CQ.Ext.reg("HeaderPagetabs", CQ.form.HeaderPageTabs);