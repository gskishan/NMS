frappe.ui.form.on("Lead", {
    refresh: function(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__("Estimation"), function() {
                frappe.route_options = {
                    "lead": frm.doc.name,
                };
                frappe.set_route("estimation", "new-estimation");
            });

            frm.add_custom_button("Create Project", function() {
                frappe.call({
                    method: "frappe.client.get",
                    args: {
                        doctype: "Lead",
                        name: frm.doc.name
                    },
                    callback: function(r) {
                        if(r.message) {
                            // Assuming "attach" is the attachment field and "html_field" is the text editor field in Lead
                            let attachment = r.message.custom_attach; // Field for file attachment
                            let html_field = r.message.custom_body; // Field for the HTML content
							console.log(html_field)
                            frm.set_value("custom_body",html_field)
                            // Redirect to new Project with these values
                            frappe.route_options = {
                                "lead": frm.doc.name,
                                
                            };
							frm.refresh_fields(r.message.custom_body)
                            frappe.set_route("project", "new-project");
                        }
                    }
                });
            });
        }
    }
});
