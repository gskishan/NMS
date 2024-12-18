// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Daily Report", {
    refresh: function(frm) {
        if (!frm.is_new()) {
                frm.add_custom_button(__("Journal Entry"), function() {
                   
                    frappe.route_options = {
                        "custom_daily_report": frm.doc.name, 
                        "custom_task":frm.doc.task,
                        "custom_client":frm.doc.custom_client,
                        "custom_cost_center":frm.doc.custom_cost_center,
                        "custom_contract_type":frm.doc.custom_contract_type,
                        "custom_project":frm.doc.project
                    };
                    frappe.new_doc("Journal Entry");
                });
    }
}
});
