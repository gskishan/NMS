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
    custom_is_invoice: function(frm){
        manage_buttons(frm)
    }
    
});

function manage_buttons(frm) {
   
    frm.clear_custom_buttons();


    if (frm.doc.custom_is_invoice) {
        frm.add_custom_button(__('Sales Invoice'), function () {
            create_sales_invoice(frm);
        }, __("Create"));
    }

    if (frm.doc.custom_is_daily_divine_log) {
        frm.add_custom_button(__('Daily Diving Log'), function () {
            frappe.new_doc('Daily Diving Log',{},doc =>{
                doc.task = frm.doc.name
                doc.client = frm.doc.custom_client
                doc.cost_center = frm.doc.custom_cost_center
                doc.contract_type = frm.doc.custom_contract_type
                doc.project = frm.doc.project
            });
        });
    }

   
    if (frm.doc.custom_is_daily_report) {
        frm.add_custom_button(__('Daily Report'), function () {
            frappe.new_doc('Daily Report',{},doc =>{
                doc.task = frm.doc.name
                doc.custom_client = frm.doc.custom_client
                doc.custom_cost_center = frm.doc.custom_cost_center
                doc.custom_contract_type = frm.doc.custom_contract_type
                doc.project = frm.doc.project
            });
        });
    }

	 if (frm.doc.custom_is_fuel_log) {
        frm.add_custom_button(__('Fuel Log'), function () {
            frappe.new_doc('Fuel Log',{},doc =>{
                doc.lead = frm.doc.custom_lead
                doc.estimation = frm.doc.custom_estimation
                doc.quotation = frm.doc.custom_quotation
                doc.project = frm.doc.project
                doc.planning = frm.doc.custom_planning
                doc.sales_order = frm.doc.custom_sales_order
				 doc.sales_invoice = frm.doc.custom_contract_type
            });
        });
    }

    if (frm.doc.custom_is_meal) {
        frm.add_custom_button(__('Meal'), function () {
            frappe.new_doc('Meal',{},doc => {
                doc.task = frm.doc.name
                doc.client = frm.doc.custom_client
                doc.cost_center = frm.doc.custom_cost_center
                doc.contract_type = frm.doc.custom_contract_type
                doc.project = frm.doc.project
            });
        });
    }
}

function create_sales_invoice(frm) {
    frappe.model.with_doctype("Sales Invoice", function () {
        let si = frappe.model.get_new_doc("Sales Invoice");

        if (frm.doc.custom_sales_order) {
            frappe.db.get_doc("Sales Order", frm.doc.custom_sales_order)
            .then(so_doc => {
                if (so_doc && so_doc.customer) {
                   
                    si.customer = so_doc.customer;
                    si.cost_center = so_doc.cost_center;
                    si.contract_type = so_doc.contract_type;
                    si.custom_client = so_doc.custom_client;
                    si.project = so_doc.project;
                    si.custom_task = frm.doc.name;
                    si.custom_sales_order = frm.doc.custom_sales_order,
                    si.custom_lead = frm.doc.custom_lead,
                    si.custom_planning = frm.doc.custom_planning,
                    si.custom_estimation = frm.doc.custom_estimation,
                    si.custom_quotation =  frm.doc.custom_quotation
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
                                    si_item.custom_vessels = item.vessels;
                                    si_item.custom_location = item.location;
                                    si_item.custom_work_type = item.work_type;

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
