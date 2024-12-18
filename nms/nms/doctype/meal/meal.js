// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Meal", {
    refresh: function(frm) {
        if (!frm.is_new()) {
                frm.add_custom_button(__("Journal Entry"), function() {
                   
                    frappe.route_options = {
                        "custom_meal": frm.doc.name, 
                        "custom_task":frm.doc.task,
                        "custom_client":frm.doc.client,
                        "custom_cost_center":frm.doc.cost_center,
                        "custom_contract_type":frm.doc.contract_type,
                        "custom_project":frm.doc.project
                    };
                    frappe.new_doc("Journal Entry");
                });
    }
}
});
