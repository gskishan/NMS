// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Asset Maintenance Request", {
    refresh: function (frm) {
        if (!frm.is_new() && frm.doc.docstatus == 1) {
            frm.add_custom_button(__("Asset Maintenance log"), function () {
                frappe.new_doc("Asset Maintenance Log", {}, doc => {
                    const issue_html = frm.doc.issue_in_the_asset || "";

                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = issue_html;
                    const plainText = tempDiv.innerText || tempDiv.textContent || "";

                    doc.issue_in_the_asset = plainText;
                    
                    frappe.set_route("Form", "Asset Maintenance Log", doc.name);
                });
            });
        }
    }
});


