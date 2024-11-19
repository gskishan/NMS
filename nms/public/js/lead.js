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
                            frappe.route_options = {
                                "custom_lead": frm.doc.name,
                                
                            };            
                            frappe.set_route("project", "new-project");
                        }
                    }
                });
            });
        }
    }
});

frappe.ui.form.on("Lead Item",{
    quantity: function (frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
    rate: function (frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
})
function update_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
	
	let amount = row.quantity*row.rate;

	frappe.model.set_value(cdt, cdn, "amount", amount);
    frm.refresh_field("custom_lead_item");
}
