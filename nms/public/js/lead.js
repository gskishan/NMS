frappe.ui.form.on("Lead", {
    refresh: function(frm) {
        if (!frm.is_new()) {
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
                                "customer": frm.doc.custom_customer_name
                                
                            };            
                            frappe.set_route("project", "new-project");
                        }
                    }
                });
            });

            frm.add_custom_button(__("Estimation"), function() {
                frappe.route_options = {
                    "lead": frm.doc.name,
                    "client": frm.doc.custom_client,
                    "contract_type": frm.doc.custom_contract_type,
                    "cost_center": frm.doc.custom_cost_center,
                    "project": frm.doc.custom_project
                };
                frappe.set_route("estimation", "new-estimation");
            });

            frm.add_custom_button("Quotation", function() {
                frappe.call({
                    method: "frappe.client.get",
                    args: {
                        doctype: "Lead",
                        name: frm.doc.name
                    },
                    callback: function(r) {
                        frappe.new_doc("Quotation", {}, doc => {
                            console.log(r.message)
                            frappe.model.clear_table(doc, "items");
                            doc.custom_lead = frm.doc.name
                            doc.party_name = frm.doc.custom_customer_name
                            doc.custom_client = frm.doc.custom_client
                            doc.custom_contract_type = frm.doc.custom_contract_type
                            doc.custom_cost_center = frm.doc.custom_cost_center
                            doc.custom_project = frm.doc.custom_project
                            r.message.custom_lead_item.forEach(lead_item => {
                                let quot_item = frappe.model.add_child(doc,"items");
                                    quot_item.item_code = lead_item.item;
                                    quot_item.item_name = lead_item.item_name;
                                    quot_item.uom = lead_item.uom;
                                    quot_item.qty = lead_item.quantity; 
                                    quot_item.rate = lead_item.rate;
                                    quot_item.amount = lead_item.amount;
                                    quot_item.custom_vessels = lead_item.vessels;
                                    quot_item.custom_work_type = lead_item.work_type;
                                    quot_item.custom_location = lead_item.location;

                            })
                            
                            frappe.refresh_field("items");
            
                        });

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
