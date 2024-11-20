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
                            frappe.new_doc("Planning", {}, doc => {
                                console.log(r.message)
                                doc.sales_order = frm.doc.name
                                doc.customer = frm.doc.customer
                                r.message.forEach(so_item => {
                                    let pl_item = frappe.model.add_child(doc,"planning_item");
                                        
                                        pl_item.item_code = so_item.item_code;
                                        pl_item.qty = so_item.remaining_qty; 
                                        pl_item.description = so_item.description;
                                        pl_item.rate = so_item.rate;
                                        pl_item.uom = so_item.uom;
                                        pl_item.uom_conversion_factor = so_item.uom_conversion_factor;
                                        pl_item.amount = so_item.amount;
                                })
                                
                                frappe.model.clear_table(doc, "items");
                
                            });
                        } 
                    }
                });
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

