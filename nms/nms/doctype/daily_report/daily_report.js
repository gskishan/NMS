// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Daily Report", {
    refresh: function(frm) {
        if (!frm.is_new()) {
            console.log("uiooooooooooooooooooooooo")
                frm.add_custom_button(__("Journal Entry"), function() {
                   
                    frappe.route_options = {
                        "custom_daily_report": frm.doc.name, 
                    };
                    frappe.new_doc("Journal Entry");
                });
    }
}
});
