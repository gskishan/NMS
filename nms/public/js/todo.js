frappe.ui.form.on("ToDo", {
    setup: function(frm) {
        console.log("innnnnnnnnnnnnnnnnnnn")
        if (frm.doc.reference_type === "Planning") {
            console.log(frm.doc.reference_name);
            
            frappe.db.get_doc("Planning", frm.doc.reference_name).then(plan_doc => {
                console.log(plan_doc.planning_item);
                
                frm.set_value("custom_sales_order", plan_doc.sales_order);
                frm.set_value("custom_customer", plan_doc.customer);
                
                frappe.model.clear_table(frm.doc, "custom_items");
                
                plan_doc.planning_item.forEach(plan_item => {
                    let todo_item = frappe.model.add_child(frm.doc, "custom_items");
                    todo_item.item_code = plan_item.item_code;
                    todo_item.qty = plan_item.qty; 
                    todo_item.description = plan_item.description;
                    todo_item.rate = plan_item.rate;
                    todo_item.uom = plan_item.uom;
                    todo_item.uom_conversion_factor = plan_item.uom_conversion_factor;
                    todo_item.amount = plan_item.amount;
                });

                frm.refresh_field("custom_items");
                frm.save()

            })
        }
    }
});
