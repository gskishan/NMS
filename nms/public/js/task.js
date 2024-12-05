frappe.ui.form.on("Task", {
    refresh: function (frm) {
        manage_buttons(frm);
    },

    custom_is_daily_divine_log: function (frm) {
        manage_buttons(frm);
    },

    custom_is_daily_report: function (frm) {
        manage_buttons(frm);
    },

    custom_is_meal: function (frm) {
        manage_buttons(frm);
    },
    is_group: function(frm){
        manage_buttons(frm)
    }
    
});

function manage_buttons(frm) {
   
    frm.clear_custom_buttons();


    if (frm.doc.is_group) {
        frm.add_custom_button(__('Sales Invoice'), function () {
            create_sales_invoice(frm);
        }, __("Create"));
    }

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

    if (frm.doc.custom_is_meal) {
        frm.add_custom_button(__('Meal'), function () {
            frappe.new_doc('Meal');
        });
    }
}

function create_sales_invoice(frm) {
    frappe.model.with_doctype("Sales Invoice", function () {
        let si = frappe.model.get_new_doc("Sales Invoice");

        if (frm.doc.custom_sales_order) {
            frappe.db.get_value("Sales Order", frm.doc.custom_sales_order, "customer", (r) => {
                if (r && r.customer) {
                    si.customer = r.customer;
                }

          
                if (frm.doc.custom_task_items) {
                    si.items = [];
                    frm.doc.custom_task_items.forEach(item => {
                        frappe.call({
                            method: "frappe.client.get",
                            args: {
                                doctype: "Item",
                                name: item.item_code
                            },
                            callback: function (res) {
                                if (res && res.message) {
                                    let item_doc = res.message;
                                    let income_account = null;

                                  
                                    if (item_doc.item_defaults && item_doc.item_defaults.length > 0) {
                                        income_account = item_doc.item_defaults[0].income_account;
                                    }
                                    console.log(income_account)
                                    // Add item row to Sales Invoice
                                    let si_item = frappe.model.add_child(si, "items");
                                    si_item.item_code = item.item_code;
                                    si_item.item_name = item.item_name;
                                    si_item.qty = item.qty;
                                    si_item.rate = item.rate;
                                    si_item.description = item.description;
                                    si_item.uom = item.uom;
                                    si_item.stock_uom = item.uom
                                    si_item.income_account = income_account;

                                    frappe.model.set_value(si_item.doctype, si_item.name, "income_account", income_account);
                                }
                            }
                        });
                    });
                }

                frappe.set_route("Form", "Sales Invoice", si.name);
            });
        } else {
            
           
        }
    });
}
