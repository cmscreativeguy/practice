/*
 * Copyright 1997-2009 Day Management AG
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
 * @class CQ.form.HeaderMultiField
 * @extends CQ.form.CompositeField
 * The HeaderMultiField is an editable list of form fields for editing
 * multi-value properties.
 * @constructor
 * Creates a new HeaderMultiField.
 * @param {Object} config The config object
 */
var clickActions = [];  
CQ.form.HeaderMultiField = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @cfg {String} addItemLabel
     * The label to display for the addItem control.  Defaults to "Add Item".
     * @since 5.5
     */

    /**
     * @cfg {Boolean} orderable
     * If the list of fields should be orderable and Up/Down buttons
     * are rendered (defaults to true).
     */

    /**
     * @cfg {CQ.Ext.form.Field/CQ.form.CompositeField} fieldConfig
     * The configuration options for the fields. Defaults to
     * <pre><code>
{
     "xtype": "textfield"
}      </code></pre>
     */
    fieldConfig: null,

    /**
     * @cfg {String} typeHint
     * The type of the single fields, such as "String" or "Boolean". If set to "String",
     * for example, the @TypeHint will automatically be set to "String[]" to ensure that
     * a multi-value property is created. Not set by default.
     * @since 5.4
     */

    // private
    path: "",

    // private
    bodyPadding: 4,

    // the width of the field
    // private
    fieldWidth: 0,

    constructor: function(config) {
        var list = this;

        if (typeof config.orderable === "undefined") {
            config.orderable = true;
        }

        if (!config.fieldConfig) {
            config.fieldConfig = {};
        }
        if (!config.fieldConfig.xtype) {
            config.fieldConfig.xtype = "textfield";
        }
        config.fieldConfig.name = config.name;
        config.fieldConfig.ownerCt = this;
//        config.fieldConfig.style = "width:95%;";
        config.fieldConfig.orderable = config.orderable;
        config.fieldConfig.dragDropMode = config.dragDropMode;
        if (!config.addItemLabel) {
            config.addItemLabel = CQ.I18n.getMessage("Add Item");
        }

        var items = new Array();

        if(config.readOnly) {
            //if component is defined as readOnly, apply this to all items
            config.fieldConfig.readOnly = true;
        } else {
            items.push({
                xtype: "toolbar",
                cls: "cq-multifield-toolbar",
                items: [
                    "->",
                    {
                        xtype: "textbutton",
                        text: config.addItemLabel,
                        style: "padding-right:6px",
                        handler:function() {
                            list.addItem();
                        }
                    },
                    {
                        xtype: "button",
                        iconCls: "cq-multifield-add",
                        template: new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                        handler: function() {
                            list.addItem();
                        }
                    }
                ]
            });
        }

        this.hiddenDeleteField = new CQ.Ext.form.Hidden({
            "name":config.name + CQ.Sling.DELETE_SUFFIX
        });
        items.push(this.hiddenDeleteField);

        if (config.typeHint) {
            this.typeHintField = new CQ.Ext.form.Hidden({
                name: config.name + CQ.Sling.TYPEHINT_SUFFIX,
                value: config.typeHint + "[]"
            });
            items.push(this.typeHintField);
        }

        config = CQ.Util.applyDefaults(config, {
            "defaults":{
                "xtype":"headermultifielditem",
                "fieldConfig":config.fieldConfig
            },
            "items":[
                {
                    "xtype":"panel",
                    "border":false,
                    "bodyStyle":"padding:" + this.bodyPadding + "px",
                    "items":items
                }
            ]
        });
        CQ.form.HeaderMultiField.superclass.constructor.call(this,config);
        if (this.defaults.fieldConfig.regex) {
            // somehow regex get broken in this.defaults, so fix it
            this.defaults.fieldConfig.regex = config.fieldConfig.regex;
        }
        this.addEvents(
            /**
             * @event change
             * Fires when the value is changed.
             * @param {CQ.form.HeaderMultiField} this
             * @param {Mixed} newValue The new value
             * @param {Mixed} oldValue The original value
             */
            "change",
            /**
             * @event removeditem
             * Fires when an item is removed.
             * @param {CQ.form.HeaderMultiField} this
             */
            "removeditem"
        );
    },

    initComponent: function() {
        CQ.form.HeaderMultiField.superclass.initComponent.call(this);

        this.on("resize", function() {
            // resize fields
            var item = this.items.get(0);
            this.calculateFieldWidth(item);
            if (this.fieldWidth > 0) {
                for (var i = 0; i < this.items.length; i++) {
                    try {
                        this.items.get(i).field.setWidth(this.fieldWidth);
                    }
                    catch (e) {
                        CQ.Log.debug("CQ.form.HeaderMultiField#initComponent: " + e.message);
                    }
                }
            }
        });

        this.on("disable", function() {
            this.hiddenDeleteField.disable();
            if (this.typeHintField) this.typeHintField.disable();
            this.items.each(function(item/*, index, length*/) {
                if (item instanceof CQ.form.HeaderMultiField.Item) {
                    item.field.disable();
                }
            }, this);
        });

        this.on("enable", function() {
            this.hiddenDeleteField.enable();
            if (this.typeHintField) this.typeHintField.enable();
            this.items.each(function(item/*, index, length*/) {
                if (item instanceof CQ.form.HeaderMultiField.Item) {
                    item.field.enable();
                }
            }, this);
        });
    },

    // private
    afterRender : function(){
        CQ.form.HeaderMultiField.superclass.afterRender.call(this);
        this.doLayout();
    },

    calculateFieldWidth: function(item) {
        try {
            this.fieldWidth = this.getSize().width - 2*this.bodyPadding; // total row width
            for (var i = 0; i < item.items.length; i++) {
                var button = item.items.get(i);
                // subtract each button
                if (button.items && button.items.length > 0 && button.items.get(0) === item.field) {
                    // item field; not a button
                    continue;
                }
                var w = item.items.get(i).getSize().width;
                if (w == 0) {
                    // button has no size, e.g. because MV is hidden >> reset fieldWidth to avoid setWidth
                    this.fieldWidth = 0;
                    return;
                }

                this.fieldWidth -= item.items.get(i).getSize().width;
            }
        }
        catch (e) {
            // initial resize fails if the MF is on the visible first tab
            // >> reset to 0 to avoid setWidth
            this.fieldWidth = 0;
        }
    },

    /**
     * Adds a new field with the specified value to the list.
     * @param {String} value The value of the field
     */
    addItem: function(value) {
        var item = this.insert(this.items.getCount() - 1, {});
        var form = this.findParentByType("form");
        if (form)
            form.getForm().add(item.field);
        this.doLayout();

        if (item.field.processPath) item.field.processPath(this.path);
        if (value) {
            item.setValue(value);
        }

        if (this.fieldWidth < 0) {
            // fieldWidth is < 0 when e.g. the HeaderMultiField is on a hidden tab page;
            // do not set width but wait for resize event triggered when the tab page is shown
            return;
        }
        if (!this.fieldWidth) {
            this.calculateFieldWidth(item);
        }
        try {
            item.field.setWidth(this.fieldWidth);
        }
        catch (e) {
            CQ.Log.debug("CQ.form.HeaderMultiField#addItem: " + e.message);
        }
    },

    processPath: function(path) {
        this.path = path;
    },

    // overriding CQ.form.CompositeField#getValue
    getValue: function() {
        var value = new Array();
        this.items.each(function(item, index/*, length*/) {
            if (item instanceof CQ.form.HeaderMultiField.Item) {
                value[index] = item.getValue();
                index++;
            }
        }, this);
        return value;
    },

    // overriding CQ.form.CompositeField#setValue
    setValue: function(value) {
        this.fireEvent("change", this, value, this.getValue());
        var oldItems = this.items;
        oldItems.each(function(item/*, index, length*/) {
            if (item instanceof CQ.form.HeaderMultiField.Item) {
                this.remove(item, true);
                this.findParentByType("form").getForm().remove(item);
            }
        }, this);
        this.doLayout();
        if ((value != null) && (value != "")) {
            if (value instanceof Array || CQ.Ext.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    this.addItem(value[i]);
                }
            } else {
                this.addItem(value);
            }
        }
    }

});

CQ.Ext.reg("HeaderMultiField", CQ.form.HeaderMultiField);

/**
 * @private
 * @class CQ.form.HeaderMultiField.Item
 * @extends CQ.Ext.Panel
 * The HeaderMultiField.Item is an item in the {@link CQ.form.HeaderMultiField}.
 * This class is not intended for direct use.
 * @constructor
 * Creates a new HeaderMultiField.Item.
 * @param {Object} config The config object
 */
CQ.form.HeaderMultiField.Item = CQ.Ext.extend(CQ.Ext.Panel, {

    constructor: function(config) {
        var fieldConfig = CQ.Util.copyObject(config.fieldConfig);

        var items = new Array();

        if (fieldConfig.dragDropMode) {
            this.constructDrapDropConfig(items, fieldConfig);
        } else {
            this.constructButtonConfig(items, fieldConfig);
        }

        config = CQ.Util.applyDefaults(config, {
            "layout":"table",
            "anchor":"100%",
            "border":false,
            "layoutConfig":{
                "columns":4
            },
            "defaults":{
                "bodyStyle":"padding:3px"
            },
            "items":items
        });
        CQ.form.HeaderMultiField.Item.superclass.constructor.call(this, config);

        if (config.value) {
            this.field.setValue(config.value);
        }
    },

    constructButtonConfig: function(items, fieldConfig) {
        var item = this;
        this.field = CQ.Util.build(fieldConfig, true);
        items.push({
            "xtype":"panel",
            "border":false,
            "cellCls":"cq-multifield-itemct",
//            "width": 100,
            "items":item.field
        });

        if (!fieldConfig.readOnly) {
            if (fieldConfig.orderable) {
                items.push({
                    "xtype": "panel",
                    "border": false,
                    "items": {
                        "xtype": "button",
                        "iconCls": "cq-multifield-up",
                        "template": new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                        "handler": function(){
                            var parent = item.ownerCt;
                            var index = parent.items.indexOf(item);

                            if (index > 0) {
                            	var dialog = this.findParentByType("dialog");
                                var TEMPJSONOBJ = {"Remove": "no",
                    				    "Dpath": dialog.path,
                    				    "Lindex": index+1,
                    				    "Nindex": index
                    				    }
                                clickActions.push(TEMPJSONOBJ);
                                item.reorder(parent.items.itemAt(index - 1));
                            }
                        }
                    }
                });
                items.push({
                    "xtype": "panel",
                    "border": false,
                    "items": {
                        "xtype": "button",
                        "iconCls": "cq-multifield-down",
                        "template": new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                        "handler": function(){
                            var parent = item.ownerCt;
                            var index = parent.items.indexOf(item);

                            if (index < parent.items.getCount() - 1) {
                                if(index+1 < parent.items.getCount() -1){
                                	var dialog = this.findParentByType("dialog");
	                                var TEMPJSONOBJ = {"Remove": "no",
	                    				    "Dpath": dialog.path,
	                    				    "Lindex": index+2,
	                    				    "Nindex": index+1
	                    				    }
	                                clickActions.push(TEMPJSONOBJ);
                                }
                                item.reorder(parent.items.itemAt(index + 1));
                            }
                        }
                    }
                });
            }

            items.push({
                "xtype":"panel",
                "border":false,
                "items":{
                    "xtype":"button",
                    "iconCls": "cq-multifield-remove",
                    "template": new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                    "handler":function() {
                        var parent = item.ownerCt;
                        
                        var Nindex = parent.items.indexOf(item) + 1;                        
                        var totIndex = parent.items.getCount()-1 ;
                        
                        var dialog = this.findParentByType("dialog");
                        var dpath = dialog.path;
                        var TEMPJSONOBJ = {"Remove": "yes",
                        				    "Dpath": dpath,
                        				    "TotalIndex": totIndex,
                        				    "Nindex": Nindex
                        				    }
                        clickActions.push(TEMPJSONOBJ);
                        parent.remove(item);
                        parent.fireEvent("removeditem", parent);
                    }
                }
            });
        }
    },

    constructDrapDropConfig: function(items, fieldConfig) {
        var item = this;

        this.field = CQ.Util.build(fieldConfig, true);

        if (!fieldConfig.readOnly) {
            if (fieldConfig.orderable) {
                var move = CQ.Util.build({
                    "xtype":"button",
                    "iconCls": "cq-multifield-drag-handle",
                    "template": new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>')
                }, true);

                items.push(move);

                move.on("render", function() {
                    move.dragZone = new CQ.Ext.dd.DragZone(move.getEl(), {
                        item: item,
                        ddGroup: fieldConfig.name,
                        getDragData: function(e) {
                            var sourceEl = move.ownerCt.getEl();
                            sourceEl.setVisibilityMode(CQ.Ext.Element.DISPLAY);
                            if (sourceEl) {
                                d = sourceEl.dom.cloneNode(true);
                                d.id = CQ.Ext.id();
                                return {
                                    ddel: d,
                                    sourceEl: sourceEl,
                                    repairXY: CQ.Ext.fly(sourceEl).getXY()
                                }
                            }
                        },

                        getRepairXY: function() {
                            return this.dragData.repairXY;
                        },

                        onDrag: function() {
                            item.dropTarget.lock();
                        },

                        onInvalidDrop: function(target, e, id) {
                            CQ.Ext.dd.DragZone.superclass.onInvalidDrop.call(this,target, e, id);
                            item.dropTarget.unlock();
                        }
                    });
                });

                this.field.on("render", function() {
                    item.createDropTarget();
                })
            }
        }

        items.push({
            "xtype":"panel",
            "border":false,
            "cellCls":"cq-multifield-itemct",
//            "width": 100,
            "items":item.field
        });

        if (!fieldConfig.readOnly) {
            items.push({
                "xtype":"panel",
                "border":false,
                "items":{
                    "xtype":"button",
                    "iconCls": "cq-multifield-remove",
                    "template": new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                    "handler":function() {
                        var parent = item.ownerCt;
                        parent.remove(item);
                        parent.fireEvent("removeditem", parent);
                    }
                }
            });
        }
    },


//    initComponent: function() {
//        CQ.form.HeaderMultiField.Item.superclass.initComponent.call(this);
////        this.on("show", function() {console.log("show");});
////        this.on("render", function() {console.log("render");});
////        this.on("activate", function() {console.log("activate");});
////        this.on("add", function() {console.log("add");});
//
////        this.on("resize", function(p,w) {console.log("resize::",w);});
////        this.on("bodyresize", function(p,w) {console.log("bodyresize::",w);});
//
//        this.on("resize", function() {
//            var pfs = this.findByType(CQ.form.PathField);
//            for (var i = 0; i < pfs.length; i++) {
//                console.log("^^",pfs[i]);
//                pfs[i].updateEditState();
//            }
//            //            console.log("resize::",w);
//        });
//
//    },

    createDropTarget: function() {
        if( !this.field ) return;
        if( this.dropTarget ) {
            this.dropTarget.destroy();
        }

        var item = this;

        this.dropTarget = new CQ.Ext.dd.DropTarget(this.getEl(), {
            item: item,
            ddGroup : this.field.getName(),

            getPosition: function(e, element) {
                var y = e.getXY()[1];
                var region = CQ.Ext.fly(element).getRegion();
                var h = region.bottom - region.top;
                var ypos = region.bottom - y;

                if ( ypos >= (h / 2)) {
                    return "before";
                } else {
                    return "after";
                }
            },

            showTargetLine: function(el, position) {
                var extra = 2;
                var region = CQ.Ext.fly(el).getRegion();
                var x = region.left;
                var y = region.bottom - 1;
                if (position == "before") {
                    //display target obj before drop target
                    y = region.top - 1;
                }

                CQ.form.HeaderMultiField.getTargetLine().setWidth(el.getWidth());
                CQ.form.HeaderMultiField.getTargetLine().show();
                CQ.form.HeaderMultiField.getTargetLine().setPosition(x,y)
            },

            notifyOver : function(draggedObj, e, data){
                this.lastPosition =  this.getPosition(e, this.el);
                this.showTargetLine(this.el, this.lastPosition);
                return this.dropAllowed;
            },

            notifyOut : function(draggedObj, e, data){
                CQ.form.HeaderMultiField.getTargetLine().hide();
                if(this.overClass){
                    this.el.removeClass(this.overClass);
                }
            },

            notifyDrop : function(draggedObj, e, data){
                CQ.form.HeaderMultiField.getTargetLine().hide();

                var movingItem = draggedObj.item;
                var toItem = this.item;

                movingItem.move(toItem, this.lastPosition);

                return true;
            }
        });
    },

    remove: function() {
        this.ownerCt.remove(this, true);
    },

    move: function(toItem, position) {
        var movingItem = this;
        var parent = movingItem.ownerCt;

        var index = parent.items.indexOf(toItem);

        if( position == "before") {
            index--;
        } else {
            index++;
        }
        index = index == -1 ? 0 : index;
        index = index > parent.items.getCount() ? parent.items.getCount() : index;

        parent.items.insert(index, movingItem);

        if( position == "before") {
            movingItem.getEl().insertBefore(toItem.getEl());
        } else {
            movingItem.getEl().insertAfter(toItem.getEl());
        }

        movingItem.createDropTarget();

        parent.doLayout(false, true);
    },

    /**
     * Reorders the item above the specified item.
     * @param {CQ.form.HeaderMultiField.Item} item The item to reorder above
     * @member CQ.form.HeaderMultiField.Item
     */
    reorder: function(item) {
        var value = item.field.getValue();
        item.field.setValue(this.field.getValue());
        this.field.setValue(value);
    },

    /**
     * Returns the data value.
     * @return {String} value The field value
     * @member CQ.form.HeaderMultiField.Item
     */
    getValue: function() {
        return this.field.getValue();
    },

    /**
     * Sets a data value into the field and validates it.
     * @param {String} value The value to set
     * @member CQ.form.HeaderMultiField.Item
     */
    setValue: function(value) {
        this.field.setValue(value);
    }
});

CQ.Ext.reg("headermultifielditem", CQ.form.HeaderMultiField.Item);

CQ.form.HeaderMultiField.getTargetLine = function() {
    if( !CQ.form.HeaderMultiField.TargetLine ) {
        CQ.form.HeaderMultiField.TargetLine = CQ.Util.build({
            "xtype": "box",
            "renderTo": "CQ",
            "html": "<div class='cq-multifield-targetline-top-shadow-penumbra'></div>"
                + "<div class='cq-multifield-targetline-top-shadow'></div>"
                + "<div class='cq-multifield-targetline-bottom-shadow'></div>"
                + "<div class='cq-multifield-targetline-bottom-shadow-penumbra'></div>",
            "cls": "cq-multifield-targetline",
            "hidden": true,
            "hideMode": "display"
        }, true);
        CQ.form.HeaderMultiField.TargetLine.getEl().setVisibilityMode(CQ.Ext.Element.DISPLAY);
    }
    return CQ.form.HeaderMultiField.TargetLine;
};