frappe.ui.form.on("ToDo", {
    setup: function(frm) {
        if (frm.doc.reference_type === "Planning") {
            
            frappe.db.get_doc("Planning", frm.doc.reference_name).then(plan_doc => {
             
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
    },
    refresh: function (frm) {
        manage_buttons(frm);
    },

    custom_is_daily_divine_log: function (frm) {
        manage_buttons(frm);
    },

    custom_is_daily_report: function (frm) {
        manage_buttons(frm);
    },

    custom_is_daily_check: function (frm) {
        manage_buttons(frm);
    },
    
});

function manage_buttons(frm) {
   
    frm.clear_custom_buttons();

    if (frm.doc.custom_is_daily_divine_log) {
        frm.add_custom_button(__('Daily Diving Log'), function () {
            frappe.new_doc('Daily Diving Log');
        });
    }

    if (frm.doc.custom_is_daily_report) {
        frm.add_custom_button(__('Daily Report'), function () {
            frappe.new_doc('Daily Report');
        });
    }

    if (frm.doc.custom_is_daily_check) {
        frm.add_custom_button(__('Daily Check'), function () {
            frappe.new_doc('Daily Check');
        });
    }
}
