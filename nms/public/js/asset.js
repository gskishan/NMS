frappe.ui.form.on("Asset", {
    refresh: function(frm) {
        if (!frm.is_new() && frm.doc.docstatus == 1) {
            frm.add_custom_button(__("Asset Maintenance Request"), function() {
           
                frappe.new_doc("Asset Maintenance Request", {}, doc => {
                    
                    doc.asset = frm.doc.name
                    doc.asset_name = frm.doc.asset_name
                    doc.asset_category = frm.doc.asset_category
                    doc.item_code = frm.doc.item_code
                    doc.item_name = frm.doc.item_name
                    doc.location = frm.doc.location 
                    doc.department = frm.doc.department
                    doc.customer = frm.doc.customer
                });
            
                    
             
            });
        }
    }
});