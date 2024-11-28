// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Asset Maintenance Request", {
    refresh: function(frm) {
        if (!frm.is_new() && frm.doc.docstatus == 1) {
            frm.add_custom_button(__("Asset Maintenance log"), function() {
           
                frappe.new_doc("Asset Maintenance Log", {}, doc => {
                 
                });
            
                    
             
            });
        }
    }
	
});

