frappe.ui.form.on("Sales Order", {
    refresh: function(frm) {
        if (!frm.is_new() && frm.doc.docstatus == 1) {
            frm.add_custom_button(__("Create Planning"), function() {
                // Fetch remaining items for planning
                frappe.call({
                    method: "nms.nms.doctype.planning.planning.get_remaining_items_for_planning",
                    args: { sales_order: frm.doc.name },
                    callback: function(r) {
                        if (r.message && r.message.length > 0) {
                            console.log(r.message)
                            frappe.new_doc("Planning", {}, doc => {
                                console.log(r.message)
                                doc.sales_order = frm.doc.name
                                doc.customer = frm.doc.customer
                                doc.client = frm.doc.custom_client
                                doc.contract_type = frm.doc.contract_type
                                doc.cost_center = frm.doc.cost_center
                                doc.project = frm.doc.project
                                r.message.forEach(so_item => {
                                    let pl_item = frappe.model.add_child(doc,"planning_item");
                                        
                                    pl_item.item_code = so_item.item_code;
                                    pl_item.original_so_qty = so_item.original_so_qty;
                                    pl_item.completed_qty = so_item.completed_qty;   
                                    pl_item.balanced_qty = so_item.balance_qty;
                                    pl_item.opened_qty = so_item.opened_qty;   
                                    pl_item.description = so_item.description;
                                    pl_item.rate = so_item.rate;
                                    pl_item.uom = so_item.uom;
                                    pl_item.uom_conversion_factor = so_item.uom_conversion_factor;
                                    pl_item.amount = so_item.amount;
                                    pl_item.vessels = so_item.custom_vessels;
                                    pl_item.work_type = so_item.custom_work_type;
                                    pl_item.location = so_item.custom_location;
                                })
                                
                                frappe.model.clear_table(doc, "items");
                
                            });
                        } 
                    }
                });
            });
        }
        if (frm.doc.custom_quotation) {
          
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Quotation",
                    name: frm.doc.custom_quotation,
                },
                callback: function (r) {
                    if (r.message) {
                        let quotation = r.message;
                        console.log(quotation.custom_cost_center)
                        frm.set_value("cost_center", quotation.custom_cost_center);
                        frm.set_value("project", quotation.custom_project);
                        frm.set_value("contract_type", quotation.custom_contract_type);
                    }
                },
            });
        }
    }
});

frappe.ui.form.on("Sales Order Item", {

    rate: function(frm,cdt,cdn){
        calculate_total_rate_with_vat(frm,cdt,cdn)
    },    
    item_tax_template: function(frm,cdt,cdn){
        calculate_total_rate_with_vat(frm,cdt,cdn)
    }
});

function calculate_total_rate_with_vat(frm, cdt, cdn) {
    
    let row = locals[cdt][cdn];
    console.log(row.item_tax_template)
    if (row.item_tax_template) {
        
        frappe.db.get_doc('Item Tax Template', row.item_tax_template)
            .then(doc => {
    
                let total_tax_rate = 0;
                console.log(doc)
                if (doc.taxes) {
                    
                    doc.taxes.forEach(tax => {
                        total_tax_rate += tax.tax_rate || 0; 
                    });
                }

                if (row.rate) {
                    let total_rate_with_vat = row.rate + (row.rate * (total_tax_rate / 100));
                    frappe.model.set_value(cdt, cdn, 'custom_total_rate_with_vat', total_rate_with_vat);
                }
            });
    } else {
        frappe.model.set_value(cdt, cdn, 'custom_total_rate_with_vat', row.rate || 0);
    }
}

